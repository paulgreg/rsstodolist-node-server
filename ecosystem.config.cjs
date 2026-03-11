module.exports = {
  apps: [
    {
      name: 'rsstodolist-server',
      script: 'dist/index.js',
      max_memory_restart: '192M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

