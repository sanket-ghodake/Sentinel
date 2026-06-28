import type {
  ClientApi,
  Project,
  Issue,
  Scan,
  ScanStartedEvent,
  IssueFoundEvent,
  ScanCompletedEvent,
  Recommendation,
} from './clientApi';

export class MockClient implements ClientApi {
  private projects: Record<string, Project> = {};
  private issues: Record<string, Issue[]> = {};
  private scans: Record<string, Scan> = {};
  private recommendations: Record<string, Recommendation[]> = {};

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // 1. Sentinel Core (C++)
    const p1: Project = {
      id: 'proj-sentinel',
      name: 'Sentinel Core',
      path: '/workspace/sentinel',
      language: 'C++',
      gitStatus: 'clean',
      branch: 'main',
      quality: 85.5,
      rules: ['rule-sql-injection', 'rule-unused-variable'],
      plugins: ['plugin-cppcheck', 'plugin-clang-tidy'],
      history: ['commit-a1b2', 'commit-c3d4'],
      owner: 'Sanket',
      tags: ['core', 'c++20', 'security'],
      status: 'active',
      totalFiles: 42,
      totalLines: 12500,
      totalIssues: 2,
    };

    const issues1: Issue[] = [
      {
        id: 'issue-sql-1',
        title: 'SQL Injection Risk in Database Query',
        description:
          'Using string concatenation to build raw SQL queries can lead to SQL injection.',
        severity: 'Critical',
        confidence: 'High',
        category: 'Security',
        analyzerId: 'cppcheck',
        ruleId: 'rule-sql-injection',
        location: {
          fileId: 'IpcServer.cpp',
          line: 42,
          column: 12,
          length: 15,
        },
        impact: 'Allows attackers to execute arbitrary SQL commands on the SQLite database.',
        fix: {
          id: 'fix-sql-1',
          issueId: 'issue-sql-1',
          description: 'Use parameterized placeholder bindings instead of string concatenation.',
          actions: [
            {
              type: 'replace',
              estimatedTime: 10.0,
              risk: 'Low',
              safe: true,
              impact: 1.0,
              preview:
                '<<<<\n// BEFORE:\nstd::string query = "SELECT * FROM users WHERE name = \'" + input_val + "\';";\n====\n// AFTER:\nstd::string query = "SELECT * FROM users WHERE name = ?;";\nsqlite3_stmt* stmt;\nsqlite3_prepare_v2(db, query.c_str(), -1, &stmt, nullptr);\nsqlite3_bind_text(stmt, 1, input_val.c_str(), -1, SQLITE_TRANSIENT);\n>>>>',
              undoStrategy: 'Revert to string concatenation',
            },
          ],
        },
        status: 'Open',
        owner: 'Sanket',
        repository: 'proj-sentinel',
        file: 'IpcServer.cpp',
        line: 42,
        column: 12,
        message: 'SQL Injection Risk in Database Query',
        evidence: 'sql += input_val',
        references: ['OWASP Injection Guide'],
        tags: ['security', 'database'],
      },
      {
        id: 'issue-unused-1',
        title: "Unused Variable 'tempCode'",
        description: "The local variable 'tempCode' is declared but never referenced.",
        severity: 'Low',
        confidence: 'High',
        category: 'Style',
        analyzerId: 'clang-tidy',
        ruleId: 'rule-unused-variable',
        location: {
          fileId: 'JsonRpcHandler.cpp',
          line: 85,
          column: 9,
          length: 8,
        },
        impact: 'Redundant code that reduces readability.',
        fix: {
          id: 'fix-unused-1',
          issueId: 'issue-unused-1',
          description: 'Remove the unused variable declaration.',
          actions: [
            {
              type: 'delete',
              estimatedTime: 2.0,
              risk: 'Info',
              safe: true,
              impact: 0.1,
              preview: '<<<<\n// BEFORE:\nint tempCode = 5;\n====\n// AFTER:\n\n>>>>',
              undoStrategy: 'Restore variable declaration',
            },
          ],
        },
        status: 'Open',
        owner: 'Sanket',
        repository: 'proj-sentinel',
        file: 'JsonRpcHandler.cpp',
        line: 85,
        column: 9,
        message: "Unused Variable 'tempCode'",
        evidence: 'int tempCode = 5;',
        references: ['C++ Core Guidelines ES.2'],
        tags: ['style', 'refactor'],
      },
    ];

    // 2. SG Dashboard (TypeScript)
    const p2: Project = {
      id: 'proj-dashboard',
      name: 'Sg Dashboard',
      path: '/workspace/sg-dashboard',
      language: 'TypeScript',
      gitStatus: 'modified',
      branch: 'feature-ui',
      quality: 92.0,
      rules: ['rule-console-log'],
      plugins: ['plugin-eslint'],
      history: ['commit-e5f6'],
      owner: 'Sanket',
      tags: ['frontend', 'react'],
      status: 'active',
      totalFiles: 18,
      totalLines: 3400,
      totalIssues: 1,
    };

    const issues2: Issue[] = [
      {
        id: 'issue-eslint-1',
        title: 'Console.log Warning',
        description: 'Avoid using console.log in production code.',
        severity: 'Info',
        confidence: 'Medium',
        category: 'Style',
        analyzerId: 'eslint',
        ruleId: 'rule-console-log',
        location: {
          fileId: 'App.tsx',
          line: 12,
          column: 5,
          length: 11,
        },
        impact: 'Pollutes console output in production.',
        fix: {
          id: 'fix-eslint-1',
          issueId: 'issue-eslint-1',
          description: 'Remove console.log or replace with production logger.',
          actions: [
            {
              type: 'delete',
              estimatedTime: 1.0,
              risk: 'Info',
              safe: true,
              impact: 0.0,
              preview: '<<<<\n// BEFORE:\nconsole.log(data);\n====\n// AFTER:\n\n>>>>',
              undoStrategy: 'Restore console.log',
            },
          ],
        },
        status: 'Open',
        owner: 'Sanket',
        repository: 'proj-dashboard',
        file: 'App.tsx',
        line: 12,
        column: 5,
        message: 'Console.log Warning',
        evidence: 'console.log(data);',
        references: ['12-Factor App Logging'],
        tags: ['style'],
      },
    ];

    const recs1: Recommendation[] = [
      {
        id: 'rec-sql-1',
        title: 'SQL Injection Risk in Database Query',
        description:
          'Using string concatenation to build raw SQL queries can lead to SQL injection.',
        origin: 'cppcheck/rule-sql-injection',
        evidence: {
          fileId: 'IpcServer.cpp',
          line: 42,
          matchedPattern: 'sql += input_val',
        },
        explanation: {
          simple: 'User input is directly inserted into database queries without validation.',
          technical:
            'SQL query constructed via string concatenation, allowing parameter injection.',
          expert:
            'Input parameter is bound via raw string concatenation rather than parameterized SQL placeholder bindings, violating OWASP A03:2021-Injection guidelines.',
        },
        confidence: {
          score: 98,
          level: 'High',
          signals: [
            'Rule certainty',
            'Analyzer agreement',
            'Local code context',
            'Historical false-positive rate',
          ],
        },
        estimatedEffort: '2 minutes',
        estimatedImpact: 'High',
        safeAutomationLevel: 'PREVIEW',
        preview: {
          currentCode:
            'std::string query = "SELECT * FROM users WHERE name = \'" + input_val + "\';";',
          suggestedCode:
            'std::string query = "SELECT * FROM users WHERE name = ?;";\nsqlite3_bind_text(stmt, 1, input_val.c_str(), -1, SQLITE_TRANSIENT);',
          diff: '- std::string query = "SELECT * FROM users WHERE name = \'" + input_val + "\';";\n+ std::string query = "SELECT * FROM users WHERE name = ?;";\n+ sqlite3_bind_text(stmt, 1, input_val.c_str(), -1, SQLITE_TRANSIENT);',
        },
        rollbackSupport: true,
        whyNow: ['Rule enabled yesterday', 'File modified in current branch'],
        blastRadius: {
          affectedFiles: 1,
          affectedModule: 'Database',
          publicApiChanged: false,
          testsImpacted: 2,
          binaryCompatibility: 'Unchanged',
        },
        timeline: {
          detected: '2026-06-28T10:00:00Z',
          reviewed: '2026-06-28T10:15:00Z',
        },
        learningMode: {
          concept: 'SQL Injection & Parameterization',
          rationale:
            'Raw SQL concatenation opens vectors for database compromise, leading to information leakage or arbitrary command execution.',
          bestPractice: 'Always bind user inputs using parameters rather than concatenation.',
          references: ['OWASP Injection Guide', 'C++ Core Guidelines Security'],
        },
        v2Preview:
          '- std::string query = "SELECT * FROM users WHERE name = \'" + input_val + "\';";\n+ std::string query = "SELECT * FROM users WHERE name = ?;";',
        rollback: true,
      },
      {
        id: 'rec-unused-1',
        title: "Unused Variable 'tempCode'",
        description: "The local variable 'tempCode' is declared but never referenced.",
        origin: 'clang-tidy/rule-unused-variable',
        evidence: {
          fileId: 'JsonRpcHandler.cpp',
          line: 85,
          matchedPattern: 'int tempCode = 5;',
        },
        explanation: {
          simple: 'This variable is declared but never used.',
          technical: 'Local variable does not participate in any subsequent operations.',
          expert:
            'Redundant stack variable allocation increases bytecode noise and complicates readability without contributing to function semantics.',
        },
        confidence: {
          score: 99,
          level: 'High',
          signals: ['Syntax parsing accuracy', 'No usage matched'],
        },
        estimatedEffort: '1 minute',
        estimatedImpact: 'Low',
        safeAutomationLevel: 'YES',
        preview: {
          currentCode: 'int tempCode = 5;',
          suggestedCode: '',
          diff: '- int tempCode = 5;',
        },
        rollbackSupport: true,
        whyNow: ['New rule activated in style guide'],
        blastRadius: {
          affectedFiles: 1,
          affectedModule: 'IPC',
          publicApiChanged: false,
          testsImpacted: 0,
          binaryCompatibility: 'Unchanged',
        },
        timeline: {
          detected: '2026-06-28T10:05:00Z',
        },
        learningMode: {
          concept: 'Dead Code Elimination',
          rationale:
            'Keeping unused variables pollutes the codebase and can hide logical bugs where the developer intended to use the variable.',
          bestPractice:
            'Proactively remove dead variables or mark with [[maybe_unused]] if intended for debug scenarios.',
          references: ['C++ Core Guidelines ES.2'],
        },
        v2Preview: '- int tempCode = 5;',
        rollback: true,
      },
    ];

    const recs2: Recommendation[] = [
      {
        id: 'rec-eslint-1',
        title: 'Console.log Warning',
        description: 'Avoid using console.log in production code.',
        origin: 'eslint/rule-console-log',
        evidence: {
          fileId: 'App.tsx',
          line: 12,
          matchedPattern: 'console.log(data);',
        },
        explanation: {
          simple: 'Avoid printing logs directly to console in production.',
          technical: 'console.log usage bypasses central logging configuration.',
          expert:
            'Direct console invocation can leak sensitive runtime structures and slows browser UI thread rendering during intensive loops.',
        },
        confidence: {
          score: 90,
          level: 'Medium',
          signals: ['Rule certainty'],
        },
        estimatedEffort: '1 minute',
        estimatedImpact: 'Medium',
        safeAutomationLevel: 'YES',
        preview: {
          currentCode: 'console.log(data);',
          suggestedCode: '',
          diff: '- console.log(data);',
        },
        rollbackSupport: true,
        whyNow: ['Commit hook check ESLint failed'],
        blastRadius: {
          affectedFiles: 1,
          affectedModule: 'App UI',
          publicApiChanged: false,
          testsImpacted: 1,
          binaryCompatibility: 'Unchanged',
        },
        timeline: {
          detected: '2026-06-28T10:10:00Z',
        },
        learningMode: {
          concept: 'Production Logging Rules',
          rationale:
            'Use structured loggers that can toggle severity filters instead of exposing development logs to users.',
          bestPractice: 'Leverage logger services instead of raw stdout console streams.',
          references: ['12-Factor App Logging guidelines'],
        },
        v2Preview: '- console.log(data);',
        rollback: true,
      },
    ];

    this.projects[p1.id] = p1;
    this.issues[p1.id] = issues1;
    this.recommendations[p1.id] = recs1;

    this.projects[p2.id] = p2;
    this.issues[p2.id] = issues2;
    this.recommendations[p2.id] = recs2;
  }

  async GetProjects(): Promise<Project[]> {
    return Object.values(this.projects);
  }

  async OpenProject(path: string): Promise<Project> {
    const project = Object.values(this.projects).find((p) => p.path === path);
    if (!project) {
      throw new Error(`Project path ${path} does not exist`);
    }
    return project;
  }

  async RunScan(
    projectId: string,
    onProgress?: (
      event:
        | ScanStartedEvent
        | IssueFoundEvent
        | ScanCompletedEvent
        | { type: 'progress'; progress: number },
    ) => void,
  ): Promise<Scan> {
    const project = this.projects[projectId];
    if (!project) {
      throw new Error('Project ID not found');
    }

    const scanId = `scan-${Object.keys(this.scans).length + 1}`;
    const scan: Scan = {
      id: scanId,
      projectId,
      profileId: 'default',
      rules: project.rules,
      plugins: project.plugins,
      analyzers: ['cppcheck', 'clang-tidy'],
      startTime: Date.now(),
      endTime: 0,
      status: 'scanning',
    };

    project.status = 'scanning';
    this.scans[scanId] = scan;

    // Simulate async scan steps
    const runSimulation = async () => {
      // 1. Scan started (200ms)
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (onProgress) {
        onProgress({
          type: 'ScanStarted',
          scanId,
          projectId,
          timestamp: Date.now(),
        });
      }

      // Step-by-step progress simulation (5 steps)
      for (let i = 1; i <= 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (onProgress) {
          onProgress({
            type: 'progress',
            progress: i * 20, // 20% to 100%
          });
        }

        // Mid-scan discovery of a new simulated issue
        if (i === 3) {
          const now = Date.now();
          const simIssue: Issue = {
            id: `issue-simulated-${now % 1000}`,
            title: 'Unused Header Include',
            description: 'Header file <iostream> is included but no symbols from it are used.',
            severity: 'Low',
            confidence: 'Medium',
            category: 'Style',
            analyzerId: 'clang-tidy',
            ruleId: 'rule-unused-include',
            location: {
              fileId: 'EventBus.cpp',
              line: 5,
              column: 1,
              length: 19,
            },
            impact: 'Increases compilation time and bloats dependency tree.',
            fix: {
              id: `fix-simulated-${now % 1000}`,
              issueId: `issue-simulated-${now % 1000}`,
              description: 'Remove the unused header include.',
              actions: [
                {
                  type: 'delete',
                  estimatedTime: 1.0,
                  risk: 'Info',
                  safe: true,
                  impact: 0.0,
                  preview: '<<<<\n// BEFORE:\n#include <iostream>\n====\n// AFTER:\n\n>>>>',
                  undoStrategy: 'Restore include <iostream>',
                },
              ],
            },
            status: 'Open',
            owner: 'Sanket',
            repository: projectId,
            file: 'EventBus.cpp',
            line: 5,
            column: 1,
            message: 'Unused Header Include',
            evidence: '#include <iostream>',
            references: ['C++ Core Guidelines SF.12'],
            tags: ['style'],
          };

          this.issues[projectId].push(simIssue);
          project.totalIssues++;

          if (onProgress) {
            onProgress({
              type: 'IssueFound',
              scanId,
              projectId,
              issue: simIssue,
              timestamp: now,
            });
          }
        }
      }

      // Complete scan (150ms after)
      await new Promise((resolve) => setTimeout(resolve, 150));
      scan.status = 'completed';
      scan.endTime = Date.now();
      project.status = 'active';
      project.quality = Math.min(100.0, Number((project.quality + 0.5).toFixed(1)));

      if (onProgress) {
        onProgress({
          type: 'ScanCompleted',
          scanId,
          projectId,
          timestamp: Date.now(),
          totalIssuesFound: 1,
          success: true,
        });
      }
    };

    runSimulation();

    return scan;
  }

  async GetIssues(projectId: string): Promise<Issue[]> {
    const projectIssues = this.issues[projectId];
    if (!projectIssues) {
      throw new Error('Project ID not found');
    }
    return projectIssues;
  }

  async GetRecommendations(projectId: string): Promise<Recommendation[]> {
    const projectRecs = this.recommendations[projectId];
    if (!projectRecs) {
      throw new Error('Project ID not found');
    }
    return projectRecs;
  }

  async ApplyAutofix(issueId: string): Promise<boolean> {
    for (const projectId of Object.keys(this.issues)) {
      const list = this.issues[projectId];
      const issueIndex = list.findIndex((i) => i.id === issueId);
      if (issueIndex !== -1) {
        const issue = list[issueIndex];
        if (issue.status === 'Resolved') {
          return true;
        }
        issue.status = 'Resolved';

        const project = this.projects[projectId];
        if (project) {
          project.totalIssues = Math.max(0, project.totalIssues - 1);
          project.quality = Math.min(100.0, Number((project.quality + 1.5).toFixed(1)));
        }
        return true;
      }
    }
    throw new Error('Issue ID not found');
  }

  async GetProjectSummary(projectId: string): Promise<Project> {
    const project = this.projects[projectId];
    if (!project) {
      throw new Error('Project ID not found');
    }
    return project;
  }
}
