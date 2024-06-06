
var fs = require('fs')
var iconv = require('iconv-lite')

var dir = "E:/Studio/mytime/timeline/"
var server = "http://localhost:8080/spring/"

var ID3 = require("./libs/id3/id3");
// var BinaryFile = require("./libs/id3/binaryfile");

const CONFIG = {
    openLast: true,
    last: {}
}
const CONFIG_KEY = 'mytime_config'

Vue.use(ELEMENT)
new Vue({
    el: '#app',
    data() {
        return {
            msg: 'Hello',
            curSong: '',
            curSong2: '',
            curSongIndex: '',
            currentFirstIndex: '',
            currentSecondIndex: '',
            list: [],
            visible: false,
            imgs: [],
            imgs2: [],
            index: 0,
            topFolderList: [],
            firstFolderList: [],
            topIndex: 0,
            firstIndex: 0,
            curTopFolder: '',
            curFirstFolder: '',
            secondFolderList: [],
            secondIndex: 0,
            curSecondFolder: '',
            soundList: [],
            topFolder: '',
            secondFolder: '',
            topFolderMap: {},
            firstFolderMap: {},
            secondFolderMap: {},
            thirdFolder: '',
            videoPreview: {},
            showVideoPreview: false

        }
    },
    mounted() {
        this.isLoad = false
        this.loadConfig()
        this.openLast()

        this.getTopFolder() 

        
    },

    methods: {
        loadConfig() {
            const config = localStorage.getItem(CONFIG_KEY)

            if (config) {
                Object.assign(CONFIG, JSON.parse(config))
            }
        },
        saveConfig() {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(CONFIG))
        },
        showVideo(file) {
            this.showVideoPreview = true
            this.videoPreview = file
        },
        closeVideo(file) {
            this.showVideoPreview = false
        },
        openLast() {
            if (CONFIG.openLast) {
                const last = CONFIG.last
                this.topIndex = last.topIndex
                this.firstIndex = last.firstIndex
                this.secondIndex = last.secondIndex
                this.topFolder = last.topFolder
                this.secondFolder = last.secondFolder
                this.thirdFolder = last.thirdFolder
            }
        },
        selectTopFolder(folder, index) {
            this.curTopFolder = folder.path
            this.topIndex = index

            if (this.isLoad) {
                this.firstIndex = 0
                this.secondIndex = 0
            }

            this.getFirstFolder(this.curTopFolder)
        },
        selectTopFolderEl() {

            const folder = this.topFolderMap[this.topFolder].folder
            const index = this.topFolderMap[this.topFolder].index
            this.curTopFolder = folder.path
            this.topIndex = index

            if (this.isLoad) {
                this.firstIndex = 0
                this.secondIndex = 0
            }

            this.getFirstFolder(this.curTopFolder)
        },
        selectFirstFolder(folder, index) {
            this.curFirstFolder = folder.path
            this.firstIndex = index

            if (this.isLoad) {
                this.secondIndex = 0
            }            

            this.getSecondFolder(this.curFirstFolder)
        },
        selectFirstFolderEl() {
            const folder = this.firstFolderMap[this.secondFolder].folder
            const index = this.firstFolderMap[this.secondFolder].index            
            this.curFirstFolder = folder.path
            this.firstIndex = index

            if (this.isLoad) {
                this.secondIndex = 0
            }            

            this.getSecondFolder(this.curFirstFolder)
        },
        selectSecondFolder(folder, index) {
            this.curSecondFolder = folder.path
            this.secondIndex = index

            this.getFolder(this.curSecondFolder)
            this.getSoundList(this.curSecondFolder + 'sound/')
            this.getEvents(this.curSecondFolder)

            CONFIG.last = {
                topIndex: this.topIndex,
                firstIndex: this.firstIndex,
                secondIndex: this.secondIndex
            }
            
            this.isLoad = true          

            this.saveConfig()

        },
        selectSecondFolderEl() {
            const folder = this.secondFolderMap[this.thirdFolder].folder
            const index = this.secondFolderMap[this.thirdFolder].index    

            this.curSecondFolder = folder.path
            this.secondIndex = index

            this.getFolder(this.curSecondFolder)
            this.getSoundList(this.curSecondFolder + 'sound/')
            this.getEvents(this.curSecondFolder)

            CONFIG.last = {
                topIndex: this.topIndex,
                firstIndex: this.firstIndex,
                secondIndex: this.secondIndex,
                topFolder: this.topFolder,
                secondFolder: this.secondFolder,                
                thirdFolder: this.thirdFolder,
            }
            
            this.isLoad = true          

            this.saveConfig()

        },
        getTopFolder() {
            fs.readdir(dir, (err, items) => {
                for (let index = 0; index < items.length; index++) {
                    var folder = items[index]
                    const item = {
                        name: folder,
                        path: dir + folder + '/'
                    }
                    this.topFolderList.push(item)
                    this.topFolderMap[folder] = {
                        folder: item,
                        index: index
                    }
                }

                this.selectTopFolder(this.topFolderList[this.topIndex || 0], this.topIndex || 0)
            })
        },
        getFirstFolder(dir) {
            this.firstFolderList = []
            fs.readdir(dir, (err, items) => {
                for (let index = 0; index < items.length; index++) {
                    var folder = items[index]
                    const item = {
                        name: folder,
                        path: dir + folder + '/'
                    }
                    this.firstFolderList.push(item)
                    this.firstFolderMap[folder] = {
                        folder: item,
                        index: index
                    }
                }

                this.selectFirstFolder(this.firstFolderList[this.firstIndex || 0], this.firstIndex || 0)
            })
        },
        getSecondFolder(dir) {

            this.secondFolderList = []
            fs.readdir(dir, (err, items) => {
                for (let index = 0; index < items.length; index++) {
                    var folder = items[index]
                    const item = {
                        name: folder,
                        path: dir + folder + '/'
                    }
                    this.secondFolderList.push(item)
                    this.secondFolderMap[folder] = {
                        folder: item,
                        index: index
                    }
                   
                }

                this.selectSecondFolder(this.secondFolderList[this.secondIndex || 0], this.secondIndex || 0)
            })
        },
        handleHide() {
            this.visible = false
        },
        showImg(index) {
            this.visible = true
            this.index = index
        },
        playSound(sound) {
            this.curSong2 = sound.path
            setTimeout(() => {
                this.$refs.player2.play()
            })

        },
        onMp3Click(item, index) {
            this.curSong = item.path
            this.curSongIndex = index
            this.currentSecondIndex = this.secondIndex
            this.currentFirstIndex = this.firstIndex
            setTimeout(() => {
                this.$refs.player.play()
            })

        },
        getFolder(dir) {
            this.list = []
            this.imgs = []
            this.imgs2 = []
            fs.readdir(dir, (err, files) => {
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    var item;
                    var setName;

                    if (file.match(/\.mp3/)) {
                        setName = 'list'
                        item = {
                            title: file,
                            path: dir + file
                        }
                    } else if (file.match(/\.(jp[e]?g)|(png)$/i)) {
                        setName = 'imgs'
                        item = {
                            title: file.replace(/\.\w+$/g, ''),
                            path: dir + encodeURIComponent(file),
                            isPic: true
                        }
                        this.imgs2.push(item.path)
                    }  else if (file.match(/\.mp4/)) {
                        setName = 'imgs'
                        item = {
                            path: dir + file,
                            isVideo: true
                        }
                    } else {
                        continue
                    }



                    this[setName].push(item)

                    if (setName == 'list') {
                        this.loadFile(item)
                    }


                }
            })
        },
        getSoundList(dir) {
            this.soundList = []
            fs.readdir(dir, (err, files) => {
                files = files || []
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];


                    this.soundList.push({
                        title: file.length > 26 ? file.slice(0,-26) : file.slice(0, -4),
                        path: dir + file
                    })


                }
            })
        },
        getEvents(dir) {

            this.$refs.events.innerHTML = ''
            var file = dir + 'event.md'
            var exist = fs.existsSync(file)

            if (exist) {
                var content = fs.readFileSync(file)

                content = iconv.decode(content, 'utf-8')
                //创建实例
                var converter = new showdown.Converter();
                //进行转换
                var html = converter.makeHtml(content);

                this.$refs.events.innerHTML = html
            }
        },

        loadFile(item) {
            ID3.localTags(item.path, () => {
                this.showTags(item)
            }, {
                tags: ["title", "artist", "album", "picture"],
            });
        },

        showTags(item) {
            var tags = ID3.getAllTags(item.path);
            var image = tags.picture;
            if (image) {
                var base64String = "";
                for (var i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                var base64 = "data:" + image.format + ";base64," +
                    window.btoa(base64String);
                //   item.picture = base64
                this.$set(item, 'picture', base64)
                this.$set(item, 'title', tags.title)
            } else {
                document.getElementById('picture').style.display = "none";
            }
        }
    }
}
)