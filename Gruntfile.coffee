
module.exports = (grunt) ->

    grunt.loadNpmTasks 'grunt-contrib-nodeunit'
    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-contrib-uglify'

    grunt.initConfig
        nodeunit:
            all: ['test/*.coffee']
        jshint:
            all: ['amalgamate.js']
        uglify:
            options:
                report: 'gzip'
            all:
                files:
                    'amalgamate-min.js': ['amalgamate.js']

