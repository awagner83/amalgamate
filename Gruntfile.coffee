
module.exports = (grunt) ->

    grunt.loadNpmTasks 'grunt-contrib-nodeunit'

    grunt.initConfig
        nodeunit:
            all: ['test/*.coffee']

