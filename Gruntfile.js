// Generated on 2014-09-17 using generator-angular 0.9.8
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var fs = require('fs');
var serveStatic = require('serve-static');











module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: 'app',
    dist: 'dist'
  };

  var cdn = '/',
      local = '/',
      localstorageJSPrefix = cdn + 'script/',
      localstorageCSSPrefix = cdn + 'style/',
      localstorageCSSLocalPrefix = local + 'style/',
      //pri越大，加载越靠前
      localstoragePriority = [
        {key:'sea',pri:2,ext:'js'},
        {key:'app.combo',pri:1,ext:'js'}
      ];

  var localStorageRewriteScript=function(contents,filePath,prefix){
    //把源代码转换成一个function
    var filenameArray = filePath.split(/\//).slice(-1)[0].split('.');
    if(filenameArray.length>2){
      //有版本号, 删除版本号
      filenameArray.splice(filenameArray.length-2,1);
    }
    return 'window[\''+prefix+filenameArray.join('.')+'\'] = function(){'+contents+'}';
  };

  var localStorageRewriteIndex=function(contents,prefix){
    var versions = {};
    //javascripts
    var scripts = fs.readdirSync('dist/script'),
        styles = fs.readdirSync('dist/style');

    var assets = scripts.concat(styles);
    //console.log(assets);
    //脚本按照优先级排序
    assets.sort(function(a,b){
      //item.key 和 item.ext 都相同
      var ap = localstoragePriority.filter(function(item){
        if(a.indexOf(item.key)>-1 && (a.split('.').slice(-1)[0] === item.ext)){
          return item;
        }
      });
      var bp = localstoragePriority.filter(function(item){
        if(b.indexOf(item.key)>-1  && (b.split('.').slice(-1)[0] === item.ext)){
          return item;
        }
      });

      if(ap && ap[0]) {
        ap = ap[0].pri;
      }
      else{
        ap = 0;
      }
      if(bp && bp[0]) {
        bp = bp[0].pri;
      }
      else{
        bp = 0;
      }

      return bp-ap;
    });

    for(var i=0;i<assets.length;i++){
      var p = assets[i];
      var filenameArray = p.split('.');
      var ext = filenameArray[filenameArray.length-1],
          version = '',
          filename = '';
      if(filenameArray.length>2){
        //有版本号
        version = filenameArray[filenameArray.length-2];
        filename = filenameArray.slice(0,filenameArray.length-2).join('.')+'.'+ext;
      }
      else{
        filename = p;
      }
      versions[prefix[ext]+filename] = {v:version,cdn:prefix[ext+'cdn'],ext:ext};
    }

    return contents.replace(/\/\*\{\{localstorage\}\}\*\//ig,'window.versions='+JSON.stringify(versions)+';\n'+fs.readFileSync('util/localstorage.js')).
                    replace(/\/\*\{\{localstorage\-onload\-start\}\}\*\//ig,'window.onlsload=function(){').
                    replace(/\/\*\{\{localstorage\-onload\-end\}\}\*\//ig,'}').
                    replace(/<\!\-\-\{\{localstorage\-remove\-start\}\}\-\->[\s\S]*?<\!\-\-\{\{localstorage\-remove\-end\}\}\-\->/ig,'');
  };


  var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      
      js: {
        files: ['<%= yeoman.app %>/script/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      
      css:{
        files: ['<%= yeoman.app %>/style/**/*.css'],
        tasks: ['newer:jshint:all','autoprefixer','cdnify:serve'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      
      
      jsTest: {
        files: ['test/spec/**/*.js'],
        tasks: ['newer:jshint:test']
      },
      
      


      index:{
        files: ['<%= yeoman.app %>/*.html'],
        tasks: ['cdnify:serve'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },

      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/**/*.html',
          '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    
    //for cgi
    nodeServer:{
      cgi:{
        path:'.',
        port:9100,
        files:[{
          src :'backend/*.js'
        }]
      }
    },
    

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      
      proxies: [{
        context: '/cgi-bin',
        host: 'localhost',
        port: 9100,
        https: false,
        xforward: false,
        changeOrigion: false
      }],
      
      rules: [
          // Internal rewrite
          {from: '^/[a-zA-Z0-9/_?&=%]*$', to: '/index.html'}
      ],
      livereload: {
        options: {
          //open: 'http://localhost:9000/',
          middleware: function () {
              return [
                
                require('grunt-connect-proxy/lib/utils').proxyRequest,
                
                rewriteRulesSnippet,
                
                serveStatic('tmp'),
                serveStatic(appConfig.app),
                serveStatic('.')
              ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function () {
            return [
              serveStatic('tmp'),
              serveStatic('test'),
              serveStatic(appConfig.app),
              serveStatic('.')
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/script/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'tmp',
            
            '<%= yeoman.dist %>/**/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: 'tmp',
      css:'tmp/style/*.css'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      //autoprefixer把样式文件拷贝到了tmp/style
      
        servecss: {
          files: [{
            expand: true,
            cwd: '<%= yeoman.app %>/style/',
            src: '**/*.css',
            dest: 'tmp/autoprefixerstyle/'
          }]
        }
      
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath:  /\.\.\//
      }
    },

    

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/script/**/*.js',
          '!**/script/sea.js**',
          '<%= yeoman.dist %>/style/**/*.css',
          '<%= yeoman.dist %>/image/**/*.{png,jpg,jpeg,gif,webp,svg}'
          //'<%= yeoman.dist %>/style/font/**/*.{eot,svg,ttf,woff}'
        ]
      }
    },

  // Reads HTML for usemin blocks to enable smart builds that automatically
  // concat, minify and revision files. Creates configurations in memory so
  // additional tasks can operate on them
  // <!-- build:<type>(alternate search path) <path> -->
  // ... HTML Markup, list of script / link tags.
  // <!-- endbuild -->
  //设定处理顺序，html文件
    useminPrepare: {
      html: ['<%= yeoman.app %>/index.html','<%= yeoman.app %>/storage.html'],
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/**/*.html','<%= yeoman.dist %>/script/**/*.js'],
      css: ['<%= yeoman.dist %>/style/**/*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/image','<%= yeoman.dist %>/style/font']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/style/vendor.css': [
    //         '<%= yeoman.dist %>/style/**/*.css'
    //       ]
    //     }
    //   }
    // },

    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/script/app.combo.js': [
            '<%= yeoman.dist %>/script/app.combo.js'
          ]
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/image',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/image'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/image',
          src: '**/*.svg',
          dest: '<%= yeoman.dist %>/image'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true,
          minifyJS:true,
          minifyCSS:true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'view/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    

  // Replace Google CDN references
    cdnify: {
      serve:{
        options: {
          base: local
        },
        //cdnify把样式和html拷贝到tmp目录
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '**/*.html',
          dest: 'tmp'
        },{
          expand: true,
          cwd: 'autoprefixerstyle/style',
          src: '**/*.css',
          dest: 'tmp/style'
        }]
      },
      view:{
        options: {
          base: local
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/view',
          src: '**/*.{css,html}',
          dest: 'tmp/view'
        }]
      },
      viewdist:{
        options: {
          base: cdn
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/view',
          src: '**/*.{css,html}',
          dest: 'tmp/view'
        }]
      },
      dist: {
        options: {
          base: cdn
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '**/*.{css,html}',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      
      dist: {
        files: [{
          expand: true,
          //匹配.开头的文件
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            //'*.js', //for combo
            'image/**/*.{webp}'
          ]
        //图片
        }, {
          expand: true,
          cwd: 'tmp/image',
          dest: '<%= yeoman.dist %>/image',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.',
          dest: '<%= yeoman.dist %>',
          src: ['web.json','backend/*.js']
        }, {
          expand: true,
          cwd: 'app/font',
          dest: '<%= yeoman.dist %>/font',
          src: ['*.*']
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        
      ],
      test: [
        
      ],
      dist: [
        
        'imagemin',
        'svgmin'
      ]
    },

    

    

    

    rewrite: {
        localstorageScript:{
          src:'dist/script/*.js',
          editor:function(contents,filePath){
            return localStorageRewriteScript(contents, filePath, localstorageJSPrefix);
          }
        },
        localstorageIndex:{
            src:'dist/index.html',
            editor:function(contents){
              return localStorageRewriteIndex(contents, {js:localstorageJSPrefix,css:localstorageCSSLocalPrefix,csscdn:localstorageCSSPrefix});
            }
        }
    }
    
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function () {
    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      
      'autoprefixer',
      'cdnify:serve',
      
      'jshint',
      'configureRewriteRules',
      
      'nodeServer',
      'configureProxies',
      
      'connect:livereload',
      'watch'
    ]);
  });

  // grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
  //   grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
  //   grunt.task.run(['serve:' + target]);
  // });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    
  ]);


  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'concurrent:dist',
    'autoprefixer',
    
    'useminPrepare',
    'jshint',
    'concat',
    
    
    
    'copy:dist',
    
    
    'cssmin',
    'usemin',
    'cdnify:dist'
  ]);

  grunt.registerTask('buildmin', [
    'clean:dist',
    'wiredep',
    'concurrent:dist',
    'autoprefixer',
    
    'useminPrepare',
    'jshint',
    'concat',
    
    
    
    'copy:dist',
    
    
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'cdnify:dist',
    'rewrite:localstorageScript',
    'rewrite:localstorageIndex',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
