// types/index.ts
export interface BlueprintConfig {
  title?: string;
  description?: string;
  showExamples?: boolean;
}

export interface BlueprintPageProps {
  config: BlueprintConfig;
}
