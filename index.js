//vi pc-sub/index.js
var fis = module.exports =  require('fis3');

fis.require.prefixes.unshift('pc-sub');
fis.cli.name = 'pc-sub';
fis.cli.info = require('./package.json');
function createRequireConfig(ret, conf, settings, opt){
  // console.log(ret.ids)
  var idsObj = ret.ids
  var fileId = []
  var alies = {}
  var deps = {}

  var map = ret.map
  var res = map.res
  var pkg = map.pkg
  var pack = {}

  var files = Object.keys(idsObj)
  console.log(pkg)

  files.forEach(function(file,i){
    var _file = file
    file = idsObj[file]
    resFile = res[_file]
    // console.log(file)
    var requires = file.requires
    if(file._likes.isJsLike){
      alies[_file] = resFile.pkg ? pkg[resFile.pkg].uri : file.url
      // file.id = file.filename
      // file.moduleId = file.filename
      if(requires.length <= 0)return deps[_file] = void 0;
      deps[_file] = []
      requires = resFile.pkg ? requires.filter(function(req,i){
        if(!~pkg[resFile.pkg].has.indexOf(req))return req;
      }) : requires
      console.log(requires,'fffffffffffffffff')
      if(requires.length <= 0)return deps[_file] = void 0;
      requires.forEach(function(req,i){
        deps[_file].push(idsObj[req].url)
      })
    }
  })
  var config = JSON.stringify({
    alies: alies,
    deps: deps
  })
  files.forEach(function(file,i){
    var _file = file
    file = idsObj[file]
      // console.log(file._likes.isHtmlLike)
    if(file._likes.isHtmlLike){
      // console.log(file._content)
      var content = file._content
      file._content = content.replace('<!--REQUIRE_CONFIG-->',config)
    }
  })
}

fis.pcSub = function(){
  console.log(fis.get('output'),'--------------------------------------------------------------')
  fis
    // .media('dev')
    .match('**',{//这里封锁所有输出，只有配置了的才能进行输出
      deploy: fis.plugin('local-deliver',{
        to: fis.get('output')
      }),
      release: false,
      useHash: false
    })
    .match('**/(*).md',{
      rExt:'.html',
      release: '/page/$1',
      parser: fis.plugin('marked'),
    })
    .match('/page/(*).html',{
      parser: fis.plugin('handlebars',{
        dataFile:'/_data.js'
      }),
      useMap: true,
      release: '/$1.html'
    })
    .match(/(?:css|img)[\/\/](.*?)\.(.*)/,{
      release: '/static/$1.$2'
    })
    .match('*.less', {
      parser: fis.plugin('less'),
      rExt: '.css'
    })
    .match('*.{scss,sass}', {
      parser: fis.plugin('sass'),
      rExt: '.css'
    })
    .match('lib/(*).js',{
      isMod: true,
      useMap: true,
      release: '/static/$1.js'
    })
    .hook('module', {
      mode: 'amd'
    })
    .match('::package', {
      postpackager:createRequireConfig
      //, postpackager:fis.plugin('loader',{allInOne:true})
    })

  fis
    .media('pack')
    .match('::package', {
      spriter:fis.plugin('csssprites')
      //, postpackager:fis.plugin('loader',{allInOne:true})
    })
    // .match('static')
    .match('lib/*.js',{
      isMod: true,
      useMap: true,
      release: '/static/lib.js',
      packTo: '/lib/lib.js',
      optimizer: fis.plugin('uglify-js')
    })
    .match('*.{scss,sass,less,css}', {
      optimizer: fis.plugin('clean-css')
    })
    .match('css/*.{scss,sass,less,css}',{
      release: 'static/index.css',
      packTo: 'css/index.css'
    })
    .match('*.png', {
      optimizer: fis.plugin('png-compressor'),
      useSpriter: true
    })
    .match('lib/lib.js',{
      isMod: true,
      useMap: true,
      release: '/static/lib.js'
    })

}
