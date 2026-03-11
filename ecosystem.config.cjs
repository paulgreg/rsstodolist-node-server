module.exports = {
  apps: [
    {
      name: 'rsstodolist-node-server',
      script: 'dist/index.js',
      max_memory_restart: '192M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

