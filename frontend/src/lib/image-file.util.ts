export const ALLOWED_IMAGE_EXTENSIONS = [
	"png",
	"jpeg",
	"jpg",
	"svg",
	"webp",
	"avif",
	"gif",
	"bmp",
	"ico",
	"tif",
	"tiff",
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/svg+xml",
	"image/webp",
	"image/avif",
	"image/gif",
	"image/bmp",
	"image/x-icon",
	"image/vnd.microsoft.icon",
	"image/tiff",
] as const;

export const IMAGE_ACCEPT =
	".png,.jpeg,.jpg,.svg,.webp,.avif,.gif,.bmp,.ico,.tif,.tiff,image/png,image/jpeg,image/svg+xml,image/webp,image/avif,image/gif,image/bmp,image/x-icon,image/tiff";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export type ImageFileError =
	| "logo_link_error"
	| "logo_type_error"
	| "logo_empty_error"
	| "logo_size_error";

export function validateImageFile(file: File): ImageFileError | null {
	const name = (file.name || "").trim().toLowerCase();

	if (
		name.startsWith("http://") ||
		name.startsWith("https://") ||
		name.startsWith("blob:") ||
		name.startsWith("data:")
	) {
		return "logo_link_error";
	}

	const ext = name.includes(".") ? name.split(".").pop() || "" : "";
	if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
		return "logo_type_error";
	}

	if (
		file.type &&
		!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])
	) {
		return "logo_type_error";
	}

	if (file.size === 0) {
		return "logo_empty_error";
	}

	if (file.size > MAX_IMAGE_SIZE) {
		return "logo_size_error";
	}

	return null;
}
