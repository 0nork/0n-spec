#!/usr/bin/env node
/**
 * .0n Standard - CLI Tool
 *
 * Validate .0n files against the specification.
 *
 * Usage:
 *   0n validate <file.0n>     Validate a single file
 *   0n validate ~/.0n/        Validate entire config directory
 *   0n test                   Run conformance tests
 *   0n init                   Initialize ~/.0n/ directory
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}i${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}+${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}x${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}!${colors.reset} ${msg}`),
};

const BANNER = `
${colors.cyan}${colors.bright}
   .0n Standard${colors.reset}
   ${colors.cyan}Turn it on. It just works.${colors.reset}
`;

// Load schemas
const schemasDir = path.join(__dirname, 'schemas');
const schemas = {};

function loadSchemas() {
  try {
    const files = fs.readdirSync(schemasDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const name = file.replace('.json', '');
        schemas[name] = JSON.parse(fs.readFileSync(path.join(schemasDir, file), 'utf8'));
      }
    }
  } catch (e) {
    // Schemas not found, will use basic validation
  }
}

function validateFile(filePath) {
  const results = {
    file: filePath,
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!data.$0n) {
      results.errors.push('Missing $0n header');
      results.valid = false;
    } else {
      if (!data.$0n.type) {
        results.errors.push('Missing $0n.type');
        results.valid = false;
      }
      if (!data.$0n.version) {
        results.errors.push('Missing $0n.version');
        results.valid = false;
      }

      const type = data.$0n.type;

      if (type === 'connection') {
        if (!data.service) results.errors.push('Connection: missing "service" field');
        if (!data.auth) results.errors.push('Connection: missing "auth" field');
        if (data.auth && !data.auth.type) results.errors.push('Connection: missing "auth.type" field');
      }

      if (type === 'workflow') {
        if (!data.steps || !Array.isArray(data.steps)) {
          results.errors.push('Workflow: missing or invalid "steps" array');
        } else {
          data.steps.forEach((step, i) => {
            if (!step.id) results.errors.push(`Workflow: step ${i + 1} missing "id"`);
            if (!step.service) results.errors.push(`Workflow: step ${i + 1} missing "service"`);
            if (!step.action) results.errors.push(`Workflow: step ${i + 1} missing "action"`);
          });
        }
      }

      if (type === 'snapshot') {
        if (!data.target) results.warnings.push('Snapshot: missing "target" field');
        if (!data.components) results.errors.push('Snapshot: missing "components" field');
      }

      if (results.errors.length > 0) {
        results.valid = false;
      }
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      results.errors.push(`Invalid JSON: ${e.message}`);
    } else {
      results.errors.push(`Error reading file: ${e.message}`);
    }
    results.valid = false;
  }

  return results;
}

function validateDirectory(dirPath) {
  const results = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        walk(fullPath);
      } else if (file.endsWith('.0n') || file.endsWith('.0n.json')) {
        results.push(validateFile(fullPath));
      }
    }
  }

  walk(dirPath);
  return results;
}

function initDirectory() {
  const home = process.env.HOME || process.env.USERPROFILE;
  const dotOn = path.join(home, '.0n');

  const dirs = [
    dotOn,
    path.join(dotOn, 'connections'),
    path.join(dotOn, 'workflows'),
    path.join(dotOn, 'snapshots'),
    path.join(dotOn, 'history'),
    path.join(dotOn, 'cache'),
    path.join(dotOn, 'plugins'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log.success(`Created ${dir}`);
    } else {
      log.info(`Already exists: ${dir}`);
    }
  }

  const configPath = path.join(dotOn, 'config.json');
  if (!fs.existsSync(configPath)) {
    const config = {
      "$0n": {
        "type": "config",
        "version": "1.0.0",
        "created": new Date().toISOString()
      },
      "settings": {
        "ai_provider": "anthropic",
        "fallback_mode": "keyword",
        "history_enabled": true,
        "cache_enabled": true
      }
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log.success(`Created ${configPath}`);
  }

  console.log('\n' + colors.green + colors.bright + '~/.0n/ initialized!' + colors.reset);
  console.log('\nNext steps:');
  console.log('  1. Add connections: ~/.0n/connections/stripe.0n');
  console.log('  2. Create workflows: ~/.0n/workflows/my-workflow.0n');
  console.log('  3. Use with 0nMCP: npx 0nmcp');
}

function main() {
  loadSchemas();

  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(BANNER);
    console.log('Usage:');
    console.log('  0n validate <file.0n>     Validate a .0n file');
    console.log('  0n validate <directory>   Validate all .0n files in directory');
    console.log('  0n init                   Initialize ~/.0n/ directory');
    console.log('  0n test                   Run conformance tests');
    console.log('  0n help                   Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  0n validate my-workflow.0n');
    console.log('  0n validate ~/.0n/');
    console.log('  0n init');
    return;
  }

  if (command === 'init') {
    console.log(BANNER);
    initDirectory();
    return;
  }

  if (command === 'validate') {
    console.log(BANNER);
    const target = args[1];

    if (!target) {
      log.error('Please provide a file or directory to validate');
      process.exit(1);
    }

    const fullPath = path.resolve(target);

    if (!fs.existsSync(fullPath)) {
      log.error(`Path not found: ${fullPath}`);
      process.exit(1);
    }

    const stat = fs.statSync(fullPath);
    let results;

    if (stat.isDirectory()) {
      log.info(`Validating directory: ${fullPath}`);
      results = validateDirectory(fullPath);
    } else {
      results = [validateFile(fullPath)];
    }

    console.log('');

    let valid = 0;
    let invalid = 0;

    for (const result of results) {
      if (result.valid) {
        log.success(result.file);
        valid++;
      } else {
        log.error(result.file);
        for (const error of result.errors) {
          console.log(`   ${colors.red}|${colors.reset} ${error}`);
        }
        invalid++;
      }
      for (const warning of result.warnings) {
        console.log(`   ${colors.yellow}|${colors.reset} ${warning}`);
      }
    }

    console.log('');
    console.log(`${colors.bright}Results:${colors.reset} ${valid} valid, ${invalid} invalid`);

    if (invalid > 0) {
      process.exit(1);
    }
    return;
  }

  if (command === 'test') {
    console.log(BANNER);
    log.info('Running conformance tests...');

    const examplesDir = path.join(__dirname, 'examples');
    if (fs.existsSync(examplesDir)) {
      const results = validateDirectory(examplesDir);
      let passed = 0;
      let failed = 0;

      for (const result of results) {
        if (result.valid) {
          log.success(`PASS: ${path.basename(result.file)}`);
          passed++;
        } else {
          log.error(`FAIL: ${path.basename(result.file)}`);
          for (const error of result.errors) {
            console.log(`   | ${error}`);
          }
          failed++;
        }
      }

      console.log('');
      console.log(`${colors.bright}Tests:${colors.reset} ${passed} passed, ${failed} failed`);

      if (failed > 0) {
        process.exit(1);
      }
    } else {
      log.warn('No examples directory found');
    }
    return;
  }

  log.error(`Unknown command: ${command}`);
  console.log('Run "0n help" for usage');
  process.exit(1);
}

main();
