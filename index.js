/**
 * .0n Standard - Node.js Library
 *
 * Programmatic interface for the .0n standard.
 *
 * Usage:
 *   const { validate, parse, create, init, list, save } = require('0n-spec');
 */

const fs = require('fs');
const path = require('path');
const { resolve, deepGet, evaluateExpression } = require('./resolve');

const schemasDir = path.join(__dirname, 'schemas');

function loadSchema(type) {
  const schemaPath = path.join(schemasDir, `${type}.json`);
  if (fs.existsSync(schemaPath)) {
    return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  }
  return null;
}

function validate(filePathOrData) {
  let data;

  if (typeof filePathOrData === 'string') {
    const content = fs.readFileSync(filePathOrData, 'utf8');
    data = JSON.parse(content);
  } else {
    data = filePathOrData;
  }

  const result = {
    valid: true,
    errors: [],
    warnings: [],
    type: null,
    version: null,
  };

  if (!data.$0n) {
    result.errors.push('Missing $0n header');
    result.valid = false;
    return result;
  }

  if (!data.$0n.type) {
    result.errors.push('Missing $0n.type');
    result.valid = false;
  } else {
    result.type = data.$0n.type;
  }

  if (!data.$0n.version) {
    result.errors.push('Missing $0n.version');
    result.valid = false;
  } else {
    result.version = data.$0n.version;
  }

  if (data.$0n.type === 'connection') {
    if (!data.service) result.errors.push('Connection: missing "service"');
    if (!data.auth) result.errors.push('Connection: missing "auth"');
  }

  if (data.$0n.type === 'workflow') {
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      result.errors.push('Workflow: missing or empty "steps" array');
    }
  }

  if (data.$0n.type === 'snapshot') {
    if (!data.components) result.errors.push('Snapshot: missing "components"');
  }

  if (result.errors.length > 0) {
    result.valid = false;
  }

  return result;
}

function parse(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  const validation = validate(data);
  if (!validation.valid) {
    throw new Error(`Invalid .0n file: ${validation.errors.join(', ')}`);
  }

  return {
    type: data.$0n.type,
    version: data.$0n.version,
    name: data.$0n.name,
    description: data.$0n.description,
    data: data,
  };
}

function create(type, options = {}) {
  const now = new Date().toISOString();

  const base = {
    $0n: {
      type: type,
      version: options.version || '1.0.0',
      created: now,
      name: options.name || '',
      description: options.description || '',
    },
  };

  if (type === 'connection') {
    return {
      ...base,
      service: options.service || '',
      environment: options.environment || 'production',
      auth: {
        type: options.authType || 'api_key',
        credentials: options.credentials || {},
      },
      options: {},
      metadata: {},
    };
  }

  if (type === 'workflow') {
    return {
      ...base,
      trigger: options.trigger || { type: 'manual' },
      inputs: options.inputs || {},
      steps: options.steps || [],
      outputs: {},
      error_handling: {
        on_error: 'stop',
      },
    };
  }

  if (type === 'snapshot') {
    return {
      ...base,
      target: options.target || {},
      components: options.components || {},
      deployment: {
        strategy: 'merge',
        dry_run: false,
        rollback_on_error: true,
      },
    };
  }

  if (type === 'config') {
    return {
      ...base,
      settings: {
        ai_provider: 'anthropic',
        fallback_mode: 'keyword',
        history_enabled: true,
        cache_enabled: true,
      },
      default_services: [],
      plugins: [],
    };
  }

  return base;
}

function getDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, '.0n');
}

function isInitialized() {
  return fs.existsSync(getDir());
}

function init() {
  const dotOn = getDir();

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
    }
  }

  const configPath = path.join(dotOn, 'config.json');
  if (!fs.existsSync(configPath)) {
    const config = create('config', { name: 'Global Config' });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  return dotOn;
}

function list(type) {
  const dotOn = getDir();
  const typeDir = path.join(dotOn, `${type}s`);

  if (!fs.existsSync(typeDir)) {
    return [];
  }

  const files = fs.readdirSync(typeDir);
  return files
    .filter(f => f.endsWith('.0n') || f.endsWith('.0n.json'))
    .map(f => {
      const filePath = path.join(typeDir, f);
      const parsed = parse(filePath);
      return {
        file: f,
        path: filePath,
        ...parsed,
      };
    });
}

function save(data, filePath) {
  if (data.$0n) {
    data.$0n.updated = new Date().toISOString();
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

module.exports = {
  validate,
  parse,
  create,
  save,
  getDir,
  isInitialized,
  init,
  list,
  loadSchema,
  resolve,
  deepGet,
  evaluateExpression,
  TYPES: ['connection', 'workflow', 'snapshot', 'config', 'execution'],
  VERSION: '1.1.0',
};
