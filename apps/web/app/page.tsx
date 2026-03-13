import { UserRole } from "@my-project/shared-schema";

export default function Home() {
  return (
    <div>
      <h1>Web App</h1>
      <p>
        Shared schema loaded successfully. User roles:{" "}
        {Object.values(UserRole).join(", ")}
      </p>
    </div>
  );
}
