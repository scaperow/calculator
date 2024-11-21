import Parse from 'parse'

Parse.initialize(process.env.NUXT_ENV_PARSE_ID, process.env.NUXT_ENV_PARSE_KEY)
Parse.serverURL = process.env.NUXT_ENV_PARSE_URL