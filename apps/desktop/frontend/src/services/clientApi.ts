export interface Location {
  fileId: string;
  line: number;
  column: number;
  length: number;
}

export interface Action {
  type: string;
  estimatedTime: number;
  risk: string;
  safe: boolean;
  impact: number;
  preview: string;
  undoStrategy: string;
}

export interface Fix {
  id: string;
  issueId: string;
  description: string;
  actions: Action[];
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  confidence: 'High' | 'Medium' | 'Low';
  category: string;
  analyzerId: string;
  ruleId: string;
  location: Location;
  impact: string;
  fix?: Fix;
  status: 'Open' | 'Resolved';
  owner: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  language: string;
  gitStatus: string;
  branch: string;
  quality: number;
  rules: string[];
  plugins: string[];
  history: string[];
  owner: string;
  tags: string[];
  status: 'active' | 'scanning' | 'error';
  totalFiles: number;
  totalLines: number;
  totalIssues: number;
}

export interface Scan {
  id: string;
  projectId: string;
  profileId: string;
  rules: string[];
  plugins: string[];
  analyzers: string[];
  startTime: number;
  endTime: number;
  status: 'scanning' | 'completed' | 'failed';
}

// Event structures for progress updates
export interface ScanStartedEvent {
  type: 'ScanStarted';
  scanId: string;
  projectId: string;
  timestamp: number;
}

export interface IssueFoundEvent {
  type: 'IssueFound';
  scanId: string;
  projectId: string;
  issue: Issue;
  timestamp: number;
}

export interface ScanCompletedEvent {
  type: 'ScanCompleted';
  scanId: string;
  projectId: string;
  timestamp: number;
  totalIssuesFound: number;
  success: boolean;
}

export interface ClientApi {
  OpenProject(path: string): Promise<Project>;
  RunScan(
    projectId: string,
    onProgress?: (
      event:
        | ScanStartedEvent
        | IssueFoundEvent
        | ScanCompletedEvent
        | { type: 'progress'; progress: number },
    ) => void,
  ): Promise<Scan>;
  GetIssues(projectId: string): Promise<Issue[]>;
  ApplyAutofix(issueId: string): Promise<boolean>;
  GetProjectSummary(projectId: string): Promise<Project>;
  GetProjects(): Promise<Project[]>;
}
