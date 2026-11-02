export interface AvatarProps {
  name?:     string;
  size?:     "sm" | "md" | "lg";
  className?: string;
}

const sizeClass = { sm: "avatar-sm", md: "avatar-md", lg: "avatar-lg" };

function initials(name = ""): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`avatar ${sizeClass[size]} ${className}`}
      aria-label={name ?? "Usuario"}
      title={name}
      role="img"
    >
      {initials(name)}
    </div>
  );
}
