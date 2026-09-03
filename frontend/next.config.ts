import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Exported as static files and served by the FastAPI backend.
  output: "export",
};

export default nextConfig;
