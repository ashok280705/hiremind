export const SKILL_ALIASES: Record<string, string> = {
  "postgres": "postgresql",
  "node.js": "nodejs",
  "node": "nodejs",
  "golang": "go",
  "next.js": "nextjs",
  "nuxt.js": "nextjs",
  "reactjs": "react",
  "react.js": "react",
  "vue.js": "vue",
  "vuejs": "vue",
  "ml": "machine learning",
  "dl": "deep learning",
  "k8s": "kubernetes",
  "tf": "tensorflow",
  "hf": "huggingface",
  "sklearn": "scikit-learn",
};

export function canonical(skill: string): string {
  const s = skill.toLowerCase().trim();
  return SKILL_ALIASES[s] ?? s;
}

export const SKILLS_VOCAB = new Set([
  // Languages
  "python","java","javascript","typescript","c++","c#","golang","go",
  "rust","kotlin","swift","ruby","php","scala","r","matlab",
  // Frontend
  "react","angular","vue","next.js","nuxt","svelte","redux",
  "html","css","sass","tailwind","bootstrap",
  // Backend
  "fastapi","flask","django","node.js","express","nestjs",
  "spring","spring boot","rails",".net","graphql","rest api","grpc",
  // Databases
  "postgresql","postgres","mysql","mongodb","redis","elasticsearch",
  "cassandra","dynamodb","sqlite","oracle","sql server","neo4j",
  // Cloud / DevOps
  "aws","azure","gcp","docker","kubernetes","terraform","ansible",
  "jenkins","github actions","gitlab ci","circleci","helm","istio",
  // Data / ML
  "machine learning","deep learning","nlp","computer vision",
  "tensorflow","pytorch","keras","scikit-learn","pandas","numpy",
  "spark","hadoop","airflow","dbt","kafka","mlflow",
  "sentence transformers","huggingface","langchain","llm","rag",
  // Tooling
  "git","github","gitlab","jira","agile","scrum","kanban",
  "tdd","ci/cd","microservices","distributed systems",
  // Soft
  "leadership","communication","teamwork","problem solving",
]);
