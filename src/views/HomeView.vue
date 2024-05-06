<template>
  <div class="home">
    <h1>Note List</h1>
    <ul v-if="hasMemos">
      <li v-for="memo in memos" :key="memo.id">
        <router-link :to="{ name: 'edit', params: { id: memo.id } }">
          <p>{{ memo.title }}</p>
        </router-link>
      </li>
    </ul>
    <p v-else>メモはありません</p>
  </div>
</template>

<style scoped>

  .home{
    margin: 20px 30px 30px 30px;
    width: 100%;
  }

  ul{
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    list-style: none;
    justify-content: space-between;
    border-bottom: 1px solid #42b983;
    margin-bottom: 10px;
  }

  li a{
    color: #2c3e50;
    text-decoration: none;
    width: 90%;
  }

  p{
    font-size: 20px;
    font-weight: 600;
  }

</style>

<script>
export default {
  name: 'HomeView',
  computed: {
    hasMemos(){
      return this.$store.getters.getCount;
    },
    memos(){
      return this.$store.getters.getAll;
    }
  }
}
</script>
