"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    pug: {
      compile: {
        options: {
          pretty: true,
          data: "src/html/index.json"
        },
        files: {
          "dist/index.html": ["src/html/index.pug"]
        }
      }
    },
    concat: {
      options: {
        separator: ";",
      },
      dist: {
        src: ["src/css/**"],
        dest: "dist/assets/styles.css",
      },
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: "src/extension/",
            src: [".debug", "CSXS/**"],
            dest: "dist/"
          },
        ],
      },
/*
      deploy: {
        expand: true,
        cwd: "dist/",
        src: "**",
        dest: path.join(process.env.APPDATA, "Adobe/CEP/extensions", "<%= pkg.name %>")
      }
*/
    },
  });

  grunt.loadNpmTasks("grunt-contrib-pug");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("default", ["pug", "concat", "copy"]);
};
