module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    tslint: {
      options: {
        configuration: ".tslint.json"
      },
      files: {
        src: ['src/*.ts', 'src/urlhandlers/*.ts']
      }
    },
    typescript: {
      build: {
        src: ['src/index.ts'],
        dest: 'dist/',
        options: {
          target: 'es5',
          sourceMap: true,
          module: 'commonjs',
          removeComments: false
        }
      }
    },
    browserify: {
      dist: {
        src: 'dist/index.js',
        dest: 'dist/vast-client.js',
        options: {
          browserifyOptions: {
            standalone: 'DMVAST',
            debug: false
          }
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'dist/vast-client.js',
        dest: 'dist/vast-client.min.js'
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['clean', 'tslint', 'typescript:build', 'browserify', 'uglify']);
  // Default task.
  grunt.registerTask('default', ['build']);
};
