import { WorkspaceIndexer } from './lib/indexer';
import ActivityLogger from './lib/activity-logger';

async function main() {
  console.log('🚀 Mission Control Dashboard starting...');

  const logger = ActivityLogger.getInstance();

  // Log dashboard startup
  await logger.logActivity({
    action_type: 'dashboard_startup',
    tool_name: 'MissionControl',
    params: { mode: 'startup' },
    result_summary: 'Mission Control dashboard initialized successfully',
    files_modified: []
  });

  // Check if we should run initial indexing
  const shouldIndex = process.argv.includes('--index');

  if (shouldIndex) {
    console.log('📊 Running initial workspace indexing...');
    const indexer = new WorkspaceIndexer();
    try {
      const result = await indexer.indexAllFiles();

      await logger.logActivity({
        action_type: 'workspace_indexing',
        tool_name: 'WorkspaceIndexer',
        params: { mode: 'initial' },
        result_summary: `Indexed ${result.files} files from ${result.directories.length} directories`,
        files_modified: result.directories
      });

      console.log(`✅ Indexing complete: ${result.files} files indexed`);
      console.log('📁 Directories:', result.directories);

      indexer.close();
    } catch (error) {
      console.error('❌ Indexing failed:', error);
      process.exit(1);
    }
  }

  console.log('✨ Mission Control Dashboard ready!');
}

main().catch(console.error);