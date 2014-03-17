
module.exports = (grunt) ->

    grunt.loadNpmTasks 'grunt-contrib-nodeunit'
    grunt.loadNpmTasks 'grunt-contrib-jshint'

    grunt.initConfig
        nodeunit:
            all: ['test/*.coffee']
        jshint:
            all: ['amalgamate.js']

