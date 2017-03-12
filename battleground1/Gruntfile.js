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
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: ['player.js', 'message.js', 'microbe.js', 'food.js', 'game.js', 'env.js', 'god.js'],
                dest: 'dist/dirtchamber.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/dirtchamber.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        watch: {
            scripts: {
                files: ['<%= jshint.files %>'],
                tasks: ['default'],
                options: {
                    spawn: true,
                    event: ['all']
                }
            },
            assets: {
                files: ['assets/*.scss'],
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
                    "assets/style.css": "assets/style.scss"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};