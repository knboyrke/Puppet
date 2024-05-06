<template>
  <div id="wrapper">
    <nav id="navigation">
      <img src="@/assets/Puppet_Logo.png" id="img_logo" alt="Logo" width="165" height="75" @click="panelclick" v-if="imgtextActiv">
      <img src="@/assets/p_logo.png" id="img_logo_mini" alt="Logo" width="45" @click="panelclick" v-else>
      <ul>
        <li class="list">
          <router-link to="/">
            <span><i class="bi bi-journal-text"></i></span>
            <span class="name" v-if="imgtextActiv">Note</span>
          </router-link>
        </li>
        <li class="list">
          <router-link to="/new">
            <span><i class="bi bi-file-earmark-plus"></i></span>
            <span class="name" v-if="imgtextActiv">New</span>
          </router-link>
        </li>
        <li class="about">
          <router-link to="/about">
            <span><i class="bi bi-question-diamond"></i></span>
            <span class="name" v-if="imgtextActiv">About</span>
          </router-link>
        </li>
      </ul>
      <button id="panel" @click="panelclick"><span class="material-symbols-outlined">menu</span></button>
    </nav>
    <router-view id="contents"/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){
    return{
      panelActive: true,
      imgtextActiv: true
    }
  },
  methods: {
    panelclick(){
      this.panelActive = !this.panelActive;
      
      if(this.panelActive === false){
        this.imgtextActiv = false;
        document.getElementById('navigation').style.animationName = 'slideOutAnime';
        document.getElementById('navigation').style.width = 40 + 'px';
      }else{
        document.getElementById('navigation').style.animationName = 'slideInAnime';
        document.getElementById('navigation').style.width = 195 + 'px';
        
        setTimeout(() => {
          this.imgtextActiv = true;
        }, 420);
        
      }
      
    }
  }
}

</script>

<style>

#wrapper{
  display: flex;
  justify-content: flex-start;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 auto;
}

img {
  -webkit-user-drag: none;
}

#img_logo{
  margin-left: 15px;
}

#contents{
  max-width: 800px;
  margin-left: 350px;
}

nav {
  width: 195px;
  height: 91vh;
  border-radius: 10px;
  
  background-color: rgba(201, 255, 234, 0.2);
  border: 2px solid rgba(173, 222, 203, 0.4);
  border-radius: 5px;
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  
  padding: 20px;
  margin-top: 5px;
  margin-left: 5px;
  position: fixed;
  z-index: 1;

  animation-duration: 1s;
}


nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  justify-items: center;
  margin-top: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
}

nav a.router-link-exact-active {
  color: #00b563;
  background-color: rgba(167, 255, 217, 0.5);
  border-radius: 10px;
}

nav ul{
  padding-left:0;
  margin-top: 60px;
}

nav ul li{
  list-style:none;
  display: block;
  width:100%;
  border-radius: 30px;
}

nav li i{
  display: block;
  min-width: 45px;
  text-align: center;
  font-size: 1.5rem;
  margin-right: 20px;
}

nav li .name{
  line-height: 26px;
}

#panel{
  border: none;
  background-color: transparent;
  color: #2c3e50;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
}

@keyframes slideOutAnime{
  0% {
    width: 195px;
  }

  100% {
    width: 40px;
  }
}

@keyframes slideInAnime{
  0% {
    width: 40px;
  }

  100% {
    width: 195px;
  }
}
</style>
