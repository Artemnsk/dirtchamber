module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', '*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                jquery: true,
                globals: {
                    jQuery: true
                },
                evil: true,
                shadow: true
            }
        },
        uglify: {
            dist: {
                files: {
                    'public/app.min.js': ['src/js/**/*.js']
                }
            },
            options: {
                'sourceMap': true,
                'sourceMapIncludeSources': true
            }
        },
        watch: {
            scripts: {
                files: "src/js/**/*.js",
                tasks: ['default'],
                options: {
                    spawn: true,
                    event: ['all']
                }
            },
            assets: {
                files: ['src/scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: true,
                    event: ['all']
                }
            }
        },
        sass: {
            dist: {
                files: {
                    "public/style.css": "src/scss/**/*.scss"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['jshint', 'uglify']);
};