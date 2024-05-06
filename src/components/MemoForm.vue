<template>
    <div class="new">
        <section v-if="mermaidActive">
            <div id="buttonLineUp">
                <button id="backButton" @click="note"><span class="material-symbols-outlined">close</span></button>
                <div id="sizechange">
                    <button id="zoomin" @click="zoomIn"><span class="material-symbols-outlined">zoom_in</span></button>
                    <button id="zoomout" @click="zoomOut"><span class="material-symbols-outlined">zoom_out</span></button>
                </div>
            </div>
            <vue-mermaid-string :value="diagram" @node-click="nodeClick" id="vuemermaid" :style="{ width: widthP + '%' }"/>
        </section>
        <section v-else>
            <div id="buttonLineUp">
                <button class="btn_list" id="saveButton" @click="save"><span class="material-symbols-outlined">save</span></button>
                <button class="btn_list" id="graphButton" @click="graph"><span class="material-symbols-outlined">network_node</span></button>
                <button class="btn_list" id="removeButton" @click="remove" v-if="memo.id"><span class="material-symbols-outlined">delete</span></button>
            </div>
            <div id="title-toolbar-back"></div>
            <div class="input-block" id="titlearea">
                <input type="text" id="titleBox" spellcheck="false" v-model="title" placeholder="&nbsp;">
                <label for="titleBox">Title</label>
            </div>
            <div class="input-block" id="richEditor">
                <div id="editarea">
                    <QuillEditor :modules="modules" id="quill_Editor" theme="snow" :options="options" @click="focusEditor" spellcheck="false" v-model:content="content" contentType="html" ref="quillEditor" :toolbar="toolbarOptions" style="border: none !important; min-height: 70vh;"/>
                </div>
            </div>
        </section>

        <section v-if="modalActive">
            <div id="modal-overlay" @click="closeModal">
                <div id="modal-window">
                    <!-- <div id="modal-nav">
                        <ul>
                            <li>
                                <button class="navButton current" id="navContents" @click="nContent">Content</button>
                            </li>
                            <li>
                                <button class="navButton" id="navOverview" @click="nOverview">Overview</button>
                            </li>
                        </ul>
                    </div> -->
                    <div id="modal-contents" v-html="modalContents" v-if="modalSwitch">
                    </div>
                    <div id="modal-overview" v-html="modalOverview" v-else>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import { QuillEditor } from '@vueup/vue-quill';
    import BlotFormatter from 'quill-blot-formatter';
    import VueMermaidString from 'vue-mermaid-string';
    import endent from 'endent';

    // formula editor
    import katex from 'katex';
    import 'katex/dist/katex.min.css';
    window.katex = katex;

    /***** htag * start *****/
    
    // htag <h* : To include other tags
    const h1tag = '<h1';
    const h2tag = '<h2';
    const h3tag = '<h3';

    // Any text between <h1> and </h1>
    // 
    const h1_Regex = /<h1>(.*?)<\/h1>/;
    const h2_Regex = /<h2>(.*?)<\/h2>/;
    const h3_Regex = /<h3>(.*?)<\/h3>/;

    /***** htag * end *****/


    /***** colors * start *****/

    const h1_color = ['#7fbfff','#7f7fff','#bf7fff','#ff7f7f','#ff7fbf','#ff7fff','#ffbf7f','#daa520','#32cd32','#66cdaa','#67b5b7','#808080'];
    const h2_color = ['#4ca5ff','#4c4cff','#a54cff','#ff4c4c','#ff4ca5','#ff4cff','#ffa54c','#b8860b','#2bb32b','#3cb371','#009e9f','#333333'];
    const h3_color = ['#007fff','#0000ff','#7f00ff','#ff0000','#ff007f','#ff00ff','#ff7f00','#664b06','#176617','#008000','#00947a','#000000'];

    /***** colors * end *****/

    export default{
        name: 'MemoForm',
        props: [
            'memo'
        ],
        data(){
            return{
                title: this.memo.title,
                content: this.memo.content,
                modalActive: false, // pop up display
                mermaidActive: false, // node graph
                diagram: '', // node graph code
                hTagContentMap: new Map(),  // <key,value> = <Number, String>
                modalContents: '', // modal window contents
                modalOverview: '',
                modalSwitch: true,
                widthP: 100, // current width
                nodes: '',
                nodeNumber: 0,
                h1Count: 0,
                pinch: 0,
                twoswipe: 0,
                deltaSwipe: 65,
                h1NodeNumArr: [],
                h2NodeNumArr: [],
                h3NodeNumArr: [],
                currentLevel: 1,
                currentNodeIndex: 0,
                currentNodeId: 0,
                h1Arr_Level1: [],
                h2Arr_Level1: [],
                h3Arr_Level1: [],
                ArrIndex: [0,0,0], // index:0 h1,  index:1 h2,  index:2 h3
                flg: false
            }
        },
        components:{
            QuillEditor,
            VueMermaidString
        },
        mounted () {
            window.addEventListener('wheel', this.handleWheel, {passive: false});
        },
        beforeUnmount () {
            window.removeEventListener('wheel', this.handleWheel, {passive: false});
        },
        methods: {
            save(){
                // title required
                if(document.getElementById('titleBox').value.trim() === ''){
                    alert('タイトルを入力してください');
                }else{
                    let memo = {
                        title: this.title,
                        content: this.content
                    };

                    if(this.memo.id){
                        memo.id = this.memo.id
                    }

                    this.$store.commit('save', memo);
                    alert('正常に保存されました');
                }
            },

            remove(){
                let confirmResult = window.confirm('削除してもよろしいですか？');
                if(confirmResult === true){
                    this.$store.commit('delete',this.memo.id);
                    alert('削除しました');
                    this.$router.push('/');
                }
                
            },

            // back(){
            //     const contentHTML = this.$refs.quillEditor.getHTML();
            //     console.log(contentHTML);
            //     this.$router.push('/');
            // },

            note(){
                this.mermaidActive = false;
            },

            ValueCheck(title, content){
                let alertFlag = false;
                
                // 0:No alert  +1:title empty  +2:content empty  +3:both empty
                let alertValue = 0; 

                if(title !== undefined){
                    title = title.trim();
                    if(title === ''){
                        alertValue += 1;
                    }
                }else{
                    alertValue += 1;
                }

                if(content !== undefined){
                    // remove tags
                    content = content.replace(/<[^>]*>/g, '');
                    content = content.trim();
                    if(content === ''){
                        alertValue += 2;
                    }
                }else{
                    alertValue += 2;
                }

                if(alertValue === 1){
                    alert('タイトルを入力してください');
                }else if(alertValue === 2){
                    alert('本文を入力してください');
                }else if(alertValue === 3){
                    alert('タイトル・本文を入力してください');
                }

                if(alertValue !== 0){
                    alertFlag = true;
                }

                return alertFlag;

            },

            graph(){
                /***** declaration * start *****/

                // mermaid
                this.nodes = endent`graph TD` + `\n` + `style 0 fill:#ffefd5,stroke:#deb887,stroke-width:2px,color:#6c3524` + '\n';
                this.nodeNumber = 0;
                this.h1Count = 0;
                
                /***** declaration * end *****/

                // Map initialization
                this.hTagContentMap.clear();

                let titleValue = this.title;
                let contentValue = this.content;

                if(this.ValueCheck(titleValue,contentValue) === false){
                    if(this.TagJudge(contentValue) !== -1){
                        this.mermaidActive = true;
                        const contentHTML = this.$refs.quillEditor.getHTML();

                        // Remove all text prior to Heading 1.
                        let adjustedText = contentHTML.slice(contentHTML.indexOf('<h1'));
                        this.NodeSplit(adjustedText); 
                    }else{
                        alert('Heading1（見出し1）がありません');
                    }
                }
            },
            TagJudge(htmlStr){
                //Check if heading 1 is included.
                const tagRegex = /<h1/;
                const tagNumber = htmlStr.match(tagRegex);

                if(tagNumber){
                    let number = tagNumber[1];
                    return number;
                }

                return -1;
            },

            SplitText(htmlStr,htag){
                let splitTxt = htmlStr.split(htag).filter(p => p.trim() !== "");
                splitTxt = splitTxt.map(function(element){
                    return htag + element;
                });

                return splitTxt;
            },

            DeletePreHeading(htmlStr, htag){
                return htmlStr.substring(htmlStr.indexOf(htag));
            },

            NodeSplit(htmlStr){

                /***** heading1 * start *****/
                // Split sentences with h tags
                let h1_splitTxt = this.SplitText(htmlStr,h1tag);
                
                // Declare with 'data' to allow variables to be used throughout
                this.h1Arr_Level1 = [];
                this.h2Arr_Level1 = [];
                this.h3Arr_Level1 = [];
                for(let h1_eachParagraph of h1_splitTxt){
                    let h1Match = h1_eachParagraph.match(h1_Regex);
                    if(h1Match && h1Match.length > 1){
                        // color setting
                        this.h1Count++;
                        var colorNumber = this.h1Count % 12; 

                        // Extracts the tagged area and removes the tag
                        var heading = h1Match[1];
                        heading = heading.replace(/<[^>]*>/g, '');

                        // Assign node number and store contents in Map
                        this.nodeNumber++;
                        this.hTagContentMap.set(this.nodeNumber, h1_eachParagraph);
                        // for interaction 
                        this.h1NodeNumArr.push(Number(this.nodeNumber));
                        this.h1Arr_Level1.push(Number(this.nodeNumber));
                        
                        // create a node
                        this.nodes += 
                        `0(("` + this.title + `"))` + `---` + this.nodeNumber + `("` + heading + `")\n`
                        + `click ` + this.nodeNumber + `\n`
                        + `style ` + this.nodeNumber + ` fill:` + h1_color[colorNumber] + `,stroke:` + h1_color[colorNumber] + `,stroke-width:2px,color:#fff\n`;

                        // Determine a parent node
                        var h1_parentNode = this.nodeNumber;
                    }

                    // Delete content up to this heading
                    let h2_splitTxt = this.SplitText(this.DeletePreHeading(h1_eachParagraph,h2tag),h2tag);

                    /***** heading2 * start *****/
                    let h2Arr_Level2 = [];
                    let h3Arr_Level2 = [];
                    for(let h2_eachParagraph of h2_splitTxt){
                        // Remove superfluous tags
                        h2_eachParagraph = h2_eachParagraph.replace(/<h2<h/,'<h');
                        let h2Match = h2_eachParagraph.match(h2_Regex);

                        if(h2Match && h2Match.length > 1){
                            this.nodeNumber++;
                            this.hTagContentMap.set(this.nodeNumber, h2_eachParagraph);
                            this.h2NodeNumArr.push(Number(this.nodeNumber));
                            h2Arr_Level2.push(Number(this.nodeNumber));

                            heading = h2Match[1];
                            heading = heading.replace(/<[^>]*>/g, '');

                            this.nodes += 
                            h1_parentNode + `---` + this.nodeNumber + `(["` + heading + `"])\n`
                            + `click ` + this.nodeNumber + `\n`
                            + `style ` + this.nodeNumber + ` fill:` + h2_color[colorNumber] + `,stroke:` + h2_color[colorNumber] + `,stroke-width:2px,color:#fff\n`;

                            var h2_parentNode = this.nodeNumber;
                        }
                        
                        let h3_splitTxt = this.SplitText(this.DeletePreHeading(h2_eachParagraph,h3tag),h3tag);

                        /***** heading3 * start *****/
                        
                        let h3Arr_Level3 = [];
                        for(let h3_eachParagraph of h3_splitTxt){
                            h3_eachParagraph = h3_eachParagraph.replace(/<h3<h/,'<h');
                            let h3Match = h3_eachParagraph.match(h3_Regex);

                            if(h3Match && h3Match.length > 1){
                                this.nodeNumber++;
                                this.hTagContentMap.set(this.nodeNumber, h3_eachParagraph);
                                this.h3NodeNumArr.push(Number(this.nodeNumber));
                                h3Arr_Level3.push(Number(this.nodeNumber));

                                heading = h3Match[1];
                                heading = heading.replace(/<[^>]*>/g, '');

                                this.nodes += 
                                h2_parentNode + `---` + this.nodeNumber + `>"` + heading + `"]\n`
                                + `click ` + this.nodeNumber + `\n`
                                + `style ` + this.nodeNumber + ` fill:` + h3_color[colorNumber] + `,stroke:` + h3_color[colorNumber] + `,stroke-width:2px,color:#fff\n`;
                            }
                        }
                        h3Arr_Level2.push(h3Arr_Level3);
                    }
                    this.h2Arr_Level1.push(h2Arr_Level2);
                    this.h3Arr_Level1.push(h3Arr_Level2);
                }

                // Make the edge color gray
                for(let i = 0; i<this.nodeNumber;i++){
                    this.nodes += `linkStyle ` + i + ` stroke:#808080, stroke-width:2px\n`;
                }

                
                // Generate Diagrams
                this.diagram = this.nodes;
            },

            focusEditor(){
                // Clicking in the editor frame displays the cursor and activates the editor
                this.$refs.quillEditor.focus();
            },

            closeModal(event) {
                // Click on the gray background area to clear the pop-up display
                if (event.target.closest('#modal-window') === null) {
                    this.modalActive = false;
                    document.querySelector('body').classList.remove('modal-opened');
                }
            },

            zoomIn() {
                if (this.widthP < 500) {
                    this.widthP += 30;
                }
            },

            zoomOut() {
                if (this.widthP > 100) {
                    this.widthP -= 30;
                }
            },

            nodeClick(nodeId){
                this.currentNodeId = Number(nodeId);
                
                // Pop-up display
                this.modalSwitch = true;
                this.modalActive = true;
                this.modalContents = this.hTagContentMap.get(this.currentNodeId);
                document.querySelector('body').classList.add('modal-opened');
                this.nodeLevel(this.currentNodeId);
                this.SearchIndex(this.currentNodeId);
            },

            /**
             * get the current level on node which is clicked
             * @param {*} nodeId 
             */
            nodeLevel(currentNode){
                if(this.h1NodeNumArr.includes(currentNode)){
                    this.currentLevel = 1;
                }else if(this.h2NodeNumArr.includes(currentNode)){
                    this.currentLevel = 2;
                }else{
                    this.currentLevel = 3;
                }
            },

            SearchIndex(node){
                if(this.currentLevel === 1){
                    this.ArrIndex[0] = this.h1Arr_Level1.indexOf(node);

                }else if(this.currentLevel === 2){
                    let flg = false;
                    for (let i = 0; i < this.h2Arr_Level1.length; i++) {
                        for (let j = 0; j < this.h2Arr_Level1[i].length; j++) {
                            if(this.h2Arr_Level1[i][j] === node){
                                flg = true;

                                this.ArrIndex[0] = i;
                                this.ArrIndex[1] = j;
                                break;
                            }
                        }
                        if(flg === true){
                            break;
                        }
                    }

                }else{
                    let flg = false;
                    for (let i = 0; i < this.h3Arr_Level1.length; i++) {
                        for (let j = 0; j < this.h3Arr_Level1[i].length; j++) {
                            for(let k = 0; k < this.h3Arr_Level1[i][j].length; k++){
                                if(this.h3Arr_Level1[i][j][k] === node){
                                    flg = true;

                                    this.ArrIndex[0] = i;
                                    this.ArrIndex[1] = j;
                                    this.ArrIndex[2] = k;
                                    break;
                                }
                            }
                            if(flg === true){
                                break;
                            }
                        }
                        if(flg === true){
                            break;
                        }
                    }

                }
            },

            handleWheel(evt) {
                if (this.modalActive) {
                    const isPinch = evt.ctrlKey;

                    if (isPinch) { // pinch in/out

                        // Deactivate the default trackpad function
                        evt.preventDefault();
                        this.pinch += evt.deltaY;
                        console.log(this.pinch);
                        if (this.pinch < -60) {
                            this.pinch = 0;
                            
                            if(this.currentLevel === 1){
                                if(this.h2Arr_Level1[this.ArrIndex[0]].length > 0){
                                    this.currentLevel = 2;
                                    this.ArrIndex[1] = 0;
                                    this.modalContents = this.hTagContentMap.get(Number(this.h2Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]]));
                                }
                            }else if(this.currentLevel === 2){
                                if(this.h3Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]].length > 0){
                                    this.currentLevel = 3;
                                    this.ArrIndex[2] = 0;
                                    this.modalContents = this.hTagContentMap.get(Number(this.h3Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]][this.ArrIndex[2]]));
                                }
                            }
                        }else if(this.pinch > 60) {
                            this.pinch = 0;
                            if(this.currentLevel === 1){
                                this.modalActive = false;
                                document.querySelector('body').classList.remove('modal-opened');
                            }else 
                            if(this.currentLevel === 2){
                                this.currentLevel = 1;
                                this.modalContents = this.hTagContentMap.get(Number(this.h1Arr_Level1[this.ArrIndex[0]]));
                            }else if(this.currentLevel === 3){
                                this.currentLevel = 2;
                                this.modalContents = this.hTagContentMap.get(Number(this.h2Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]]));
                            }
                        }
                    }else{ // swipe, scroll
                        this.twoswipe = evt.deltaX;
                        
                        // トラックパッドに触れたら、0になるから
                        if(this.twoswipe === 0){
                            this.flg = false;
                        }
                        
                        // Prevents vertical movement when scrolling horizontally
                        if(!(evt.deltaY > 0.6 || evt.deltaY < -0.6)){
                            evt.preventDefault();
                        }
                        
                        if(this.flg === false){
                            if (this.twoswipe > this.deltaSwipe) {
                                this.flg = true;
                                // Determine the Level and get the element number of the node
                                if(this.currentLevel === 1){
                                    if(this.ArrIndex[0] + 1 <= this.h1Arr_Level1.length - 1){
                                        this.ArrIndex[0]++;
                                        this.modalContents = this.hTagContentMap.get(Number(this.h1Arr_Level1[this.ArrIndex[0]]));
                                    }

                                }else if(this.currentLevel === 2){
                                    if(this.ArrIndex[1] + 1 <= this.h2Arr_Level1[this.ArrIndex[0]].length - 1){
                                        this.ArrIndex[1]++;
                                        this.modalContents = this.hTagContentMap.get(Number(this.h2Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]]));
                                    }
                                    
                                }else{
                                    if(this.ArrIndex[2] + 1 <= this.h3Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]].length - 1){
                                        this.ArrIndex[2]++;
                                        this.modalContents = this.hTagContentMap.get(Number(this.h3Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]][this.ArrIndex[2]]));
                                    }
                                    
                                }
                                
                            } else if (this.twoswipe < -1 * this.deltaSwipe) {
                                this.flg = true;
                                if(this.currentLevel === 1){
                                    if(this.ArrIndex[0] - 1 >= 0){
                                        this.ArrIndex[0]--;
                                        this.modalContents = this.hTagContentMap.get(Number(this.h1Arr_Level1[this.ArrIndex[0]]));
                                    }
                                    
                                }else if(this.currentLevel === 2){
                                    if(this.ArrIndex[1] - 1 >= 0){
                                        this.ArrIndex[1]--;
                                        this.modalContents = this.hTagContentMap.get(Number(this.h2Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]]));
                                    }
                                    
                                }else{
                                    if(this.ArrIndex[2] - 1 >= 0){
                                        this.ArrIndex[2]--;
                                        this.modalContents = this.hTagContentMap.get(Number(this.h3Arr_Level1[this.ArrIndex[0]][this.ArrIndex[1]][this.ArrIndex[2]]));
                                    }
                                    
                                }
                            }
                        }
                    }
                }
            }

            // nContent(){
            //     this.modalSwitch = true;
            //     document.getElementById('navOverview').classList.remove('current');
            //     document.getElementById('navContents').classList.add('current');
            // },
            // nOverview(){
            //     this.modalSwitch = false;
            //     document.getElementById('navContents').classList.remove('current');
            //     document.getElementById('navOverview').classList.add('current');
            // }
        },

        setup: () => {
            const modules = {
                name: 'blotFormatter',  
                module: BlotFormatter
            }

            const toolbarOptions = [
                { 'font': [] },{ 'color': [] }, { 'background': [] }, {'header': [] }, 'bold', 'underline', 'strike',{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }, { 'align': [] },{ 'direction': 'rtl' }, 'link', 'image', 'video', 'formula', { 'script': 'sub'}, { 'script': 'super' },'code-block'
            ]

            const options = {
                placeholder: '入力してください',
            }

            return { modules, toolbarOptions, options }
        },
    }
</script>

<style scoped>
    .new{
        margin: 20px 30px 30px 30px;
        width: 100%;
    }

    #vuemermaid{
        margin-top: 30px;
        font-weight: 600;
    }

    #buttonLineUp{
        position: fixed;
        z-index: 1;
        top: 0;
    }

    #title-toolbar-back{
        position: fixed;
        z-index: 2;
        top: 0;
        width: 65vw;
        height: 130px;
        left: 320px;
        border-radius: 20px;
        background-color: #ffffff87;
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
    }

    #titlearea{
        position: fixed;
        z-index: 3;
        top: 0;
        margin: 30px auto;
    }

    #titleBox {
        position: relative;
        display: block;
        width: 700px;
        padding: 10px;
        border: none;
        border-bottom: solid 1px #1abc9c;
        background: linear-gradient(to bottom, transparent 92%, #1abc9c 8%) no-repeat;
        background-position: -750px 0;
        background-size: 750px 100%;
        font-size: 1.4rem;
        transition: all ease-in-out 0.3s;
    }
    
    #titleBox:focus, #titleBox:not(:placeholder-shown){
        background-position: 0 0;
        outline: none;
    }

    #titleBox:focus + label,
    #titleBox:not(:placeholder-shown) + label {
        top: -17px;
        color: #1abc9c;
        font-size: 1rem;
    }



    #titlearea label {
        position: absolute;
        top: 10px;
        color: #6c6c6c;
        font-size: 1.4rem;
        transition: all ease-in-out 0.3s;
    }

    #richEditor{
        margin-top: 70px;
        color: #000;
    }

    input {
        width: 100%;
        padding: 8px;
        font-size: 1.2rem;
    }

    h1{
        color: red !important;
    }

    .btn_list{
        position: relative;
        left: -86px;

        width: 3.5em;
        height: 3.5em;
        display: flex;
        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 25px;
        color: white;
        font-weight: 600;
        gap: 8px;
        cursor: pointer;
        overflow: hidden;
        transition-duration: .3s;
    }

    #saveButton{
        top: 135px;

        background-color: #3195ff;
        box-shadow: 0px 0px 3px #176fcd;
    }

    #saveButton:hover{
        background-color: #1e7ee4;
        box-shadow: 0px 0px 0px 4px #b1d7ff;
        transition-duration: 0ms;
    }

    #graphButton{
        top: 160px;
        background-color: #18e04d;
        box-shadow: 0px 0px 3px #0cb93a;
    }

    #graphButton:hover{
        background-color: #09b738;
        box-shadow: 0px 0px 0px 4px #94e7a9;
        transition-duration: 0ms;
    }

    #removeButton{
        top: 185px;
        background-color: #ff3198;
        box-shadow: 0px 0px 3px #b91366;
    }

    #removeButton:hover{
        background-color: #ec2b8b;
        box-shadow: 0px 0px 0px 4px #ffaad5;
        transition-duration: 0ms;
    }


    /***** mermaid * start *****/

    svg{
        width: auto;
    }

    #sizechange{
        display: flex;
        gap: 10px;
    }

    #backButton{
        position: relative;
        width: 3em;
        height: 3em;
        top: 20px;
        left: -90px;
        display: flex;
        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 25px;
        color: white;
        font-weight: 600;
        gap: 8px;
        cursor: pointer;
        overflow: hidden;
        transition-duration: .3s;
        background-color: #ff8a31;
        box-shadow: 0px 0px 3px #d76610;
    }

    #backButton:hover{
        background-color: #e8751d;
        box-shadow: 0px 0px 0px 4px #ffcea9;
        transition-duration: 0ms;
    }

    #zoomin, #zoomout {
        position: relative;
        top:-20px;
        background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
        border: 0;
        border-radius: 20px;
        color: #FFFFFF;
        cursor: pointer;
        font-weight: 800;
        outline: transparent;
        padding: 6px 8px;
        text-align: center;
        justify-items: center;
        transition: box-shadow .1s ease-in-out;
    }


    #zoomin:hover, #zoomout:hover {
        box-shadow: 0 0 .1rem rgba(191, 92, 92, 0.5), -.125rem -.125rem 1rem rgba(239, 71, 101, 0.5), .125rem .125rem 1rem rgba(255, 154, 90, 0.5);
    }

    /***** mermaid * end *****/

    
    /***** modal window * start  *****/

    #modal-overlay{
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0,0,0,.7);
            z-index: 999;
            transition: .3s;
        }


        #modal-window{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #FCFAF8;
            width: 70vw;
            border-radius: 10px;
            height: 80vh;
            margin: 0;
            padding: 30px;
            overflow-y: auto;
            transition: .3s;
        }

        #modal-contents{
            padding-left: 30px;
            padding-right: 30px;
        }
        
        .modal-opened {
            overflow-y: hidden; /*背景を固定*/
        }

        #modal-nav{
            border-bottom: 1px solid #7a7068;
            margin-bottom: 10px;
        }

        #modal-nav ul{
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            column-gap: 60px;
        }

        .navButton{
            font-weight: bold;
            border: none;
            outline: none;
            background: transparent;
            cursor: pointer;
        }

        .navButton.current{
            color: orange;
        }

        .navButton:hover{
            color: orange;
        }

        /***** modal window * end  *****/
</style>