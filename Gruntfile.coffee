
module.exports = (grunt) ->

    grunt.loadNpmTasks 'grunt-contrib-nodeunit'
    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-glue-js'

    grunt.initConfig
        nodeunit:
            all: ['test/*.coffee']
        jshint:
            all: ['src/*.js']
        uglify:
            options:
                report: 'gzip'
            all:
                files:
                    'dist/amalgamate-min.js': ['dist/amalgamate.js']
        gluejs:
            dist:
                options:
                    export: 'Amalgamate'
                dest: 'dist/amalgamate.js'
                src: ['index.js', 'src/*.js']

    grunt.registerTask 'dist', ['nodeunit', 'jshint', 'gluejs', 'uglify']

