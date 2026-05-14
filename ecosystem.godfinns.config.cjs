module.exports = {
	apps: [
		{
			name: 'agenticos-dashboard',
			script: 'build/index.js',
			cwd: '/home/godfinns/Work/agenticos-dashboard',
			env: {
				NODE_ENV: 'production',
				PORT: '4242',
				HOST: '127.0.0.1',
				VAULT_PATH: '/home/godfinns/Work/goflowtics-vault',
				CATALOG_PATH: '/home/godfinns/Work/agenticos-catalog',
				DASHBOARD_URL: 'https://os.flexmedia.is',
				AUTH_FROM: 'noreply@flexmedia.is',
				// fill these in on godfinns before starting:
				SESSION_SECRET: process.env.SESSION_SECRET ?? '',
				RESEND_API_KEY: process.env.RESEND_API_KEY ?? ''
			},
			restart_delay: 3000,
			max_restarts: 5,
			watch: false,
			log_date_format: 'YYYY-MM-DD HH:mm:ss'
		}
	]
};
