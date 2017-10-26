const path = require('path');

module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pug: {
      compile: {
        options: {
          pretty: true,
          data: 'src/html/index.json',
        },
        files: {
          'dist/index.html': ['src/html/index.pug'],
        },
      },
    },
    concat: {
      options: {
        separator: ';',
      },
      css: {
        src: ['src/css/**'],
        dest: 'dist/assets/styles.css',
      },
      js: {
        src: ['src/*.js', 'src/vendor/*.js', 'src/panel/*.js'],
        dest: 'dist/assets/scripts.js',
      },
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'src/extension/',
          src: ['.debug', 'CSXS/**'],
          dest: 'dist/',
        }],
      },
      deploy: {
        expand: true,
        cwd: 'dist/',
        src: ['.debug', '**'],
        dest: path.join(process.env.APPDATA || '/tmp', 'Adobe/CEP/extensions', '<%= pkg.name %>'),
      },
    },
    exec: {
      // Task properties fill below
    },
  });

  /**
   * Deploy changes with rsync on remote machines using `exec` tasks
   * Export host list in follow form:
   * export GRUNT_HOSTS="corr1:192.168.0.152[:8011],mari:192.168.0.172"
   * Then, run `grunt exec:deploy-corr1` or `grunt exec:deploy-mari`
   */
  if (process.env.GRUNT_HOSTS) {
    const devHosts = process.env.GRUNT_HOSTS.split(',');
    Object.keys(devHosts).forEach((key) => {
      const devHost = devHosts[key].split(':');
      const devHostAlias = devHost[0];
      const devHostIp = devHost[1];
      const devHostPort = devHost[2] || 8011;

      grunt.config.set(`exec.deploy-${devHostAlias}`, {
        command: [
          '/usr/bin/rsync',
          '-avz',
          '--exclude *.swp',
          ` --port ${devHostPort}`,
          'dist/',
          `${devHostIp}::<%= pkg.name %>`,
        ].join(' '),
      });
    });
  }

  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', ['pug', 'concat', 'copy']);
};
