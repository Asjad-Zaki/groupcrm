import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface UploadRequest {
  organization_id: string;
  folder_id?: string;
  path: string; // relative path within the drive
  mime_type: string;
  file_data: string; // base64 encoded
  original_name?: string;
}

interface DownloadRequest {
  organization_id: string;
  file_id: string;
  version?: number;
}

serve(async (req) => {
  // Create Supabase admin client with service_role key
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const pathName = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      status: 204,
    });
  }

  // Auth check - verify user belongs to organization
  const authHeader = req.headers.get("Authorization") || "";
  const userId = url.searchParams.get("user_id") || "";
  const orgId = url.searchParams.get("organization_id") || "";

  if (!orgId || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing organization_id or user_id" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Verify user belongs to organization
  const { data: membership, error: membershipError } = await supabase
    .from("user_company_memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membership) {
    return new Response(
      JSON.stringify({ error: "User not a member of this organization" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  if (pathName === "/upload" && req.method === "POST") {
    const body = (await req.json()) as UploadRequest;

    // Validate organization membership
    if (body.organization_id !== orgId) {
      return new Response(
        JSON.stringify({ error: "Organization ID mismatch" }),
        { headers: { "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(`drive_${body.organization_id}`)
      .upload(`${body.path}/${Date.now()}_${body.original_name || "file"}`, Buffer.from(body.file_data), {
        contentType: body.mime_type,
        cacheControl: "3600",
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from(`drive_${body.organization_id}`)
      .getPublicUrl(uploadData?.Key);

    // Record file in database
    const { error: dbError } = await supabase.from("drive_files").insert({
      organization_id: body.organization_id,
      folder_id: body.folder_id,
      name: body.original_name || "unknown",
      original_name: body.original_name || "unknown",
      size_bytes: Buffer.from(body.file_data).length,
      mime_type: body.mime_type,
      storage_id: uploadData?.Key || "",
      path: body.path,
      created_by: userId,
    });

    if (dbError) {
      // If DB insert fails, try to abort storage upload
      return new Response(
        JSON.stringify({ error: "Storage upload succeeded but DB record failed", storage_url: publicUrl }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Log activity
    await supabase.from("drive_activity_log").insert({
      organization_id: body.organization_id,
      action: "upload",
      user_id: userId,
      details: { storage_key: uploadData?.Key, mime_type: body.mime_type, size: Buffer.from(body.file_data).length },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        storage_url: publicUrl,
        file_id: uploadData?.Key 
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  }

  if (pathName === "/download" && req.method === "GET") {
    const fileId = url.searchParams.get("file_id") || "";
    const version = url.searchParams.get("version") ? Number(url.searchParams.get("version")) : undefined;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "Missing file_id parameter" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get file metadata
    const { data: fileData, error: fileError } = await supabase
      .from("drive_files")
      .select("*")
      .eq("id", fileId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: "File not found or access denied" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Download from Supabase Storage
    const storageName = fileData.storage_id;
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(`drive_${orgId}`)
      .download(storageName);

    if (downloadError) {
      return new Response(
        JSON.stringify({ error: downloadError.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Log activity
    await supabase.from("drive_activity_log").insert({
      organization_id: orgId,
      action: "download",
      user_id: userId,
      details: { file_id: fileId, original_name: fileData.original_name, size: fileData.size_bytes },
    });

    // Return file with proper headers
    const contentType = fileData.mime_type || "application/octet-stream";
    const contentDisposition = fileData.original_name
      ? `attachment; filename="${fileData.original_name}"`
      : "attachment";

    return new Response(downloadData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Content-Length": downloadData.size || fileData.size_bytes || undefined,
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (pathName === "/list" && req.method === "GET") {
    const folderId = url.searchParams.get("folder_id") || "";

    // List files in folder
    let query = supabase.from("drive_files").select("*").eq("organization_id", orgId);

    if (folderId) {
      query = query.eq("folder_id", folderId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: files, error: listError } = await query.order("created_at", { ascending: false });

    if (listError) {
      return new Response(
        JSON.stringify({ error: listError.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ files }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  }

  return new Response(
    JSON.stringify({ error: "Endpoint not found" }),
    { headers: { "Content-Type": "application/json" }, status: 404 }
  );
});