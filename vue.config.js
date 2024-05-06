const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: 'src/assets/AppLogo_Puppet.png',
          target: [
            {
              target: 'portable', // 'zip', 'nsis', 'portable'
              arch: ['x64'], // 'x64', 'ia32'
            },
          ],
        },
        mac: {
          icon: "src/assets/icon.png",
          target: "dmg",
        },
      }
    }
  }
})
