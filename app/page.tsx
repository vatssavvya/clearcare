import { ClearCareApp } from "@/components/clearcare-app";
import { getComprehensiveSample } from "@/lib/mock/sample";

export default function HomePage() {
  return <ClearCareApp comprehensiveSample={getComprehensiveSample()} />;
}
