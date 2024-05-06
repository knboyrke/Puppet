<template>
  <div class="about">
    <h1>Puppetの使い方</h1>
    <table class="explanation">
      <tr>
        <h3>Puppetの概要</h3>
      </tr>
      <tr>
        <th>Ⅰ.&emsp;&emsp;左の「<i class="bi bi-file-earmark-plus"></i>New」を押して、ノートを作成して下さい</th>
      </tr>
      <tr>
        <th>Ⅱ.&emsp;&emsp;タイトルを記入し、ノート本文を記入して下さい</th>
      </tr>
      <tr>
        <th>Ⅲ.&emsp;&emsp;ノートの記入が終わったら、<span style="color: #3195ff;">青いボタン</span>を押して保存して下さい</th>
      </tr>
      <tr>
        <th>Ⅳ.&emsp;&emsp;<span style="color: #18e04d;">緑のボタン</span>を押すと、ノートの内容を基にグラフが生成されます</th>
      </tr>
      <tr>
        <th>Ⅴ.&emsp;&emsp;ノートが不要になったら、<span style="color: #ff3198;">赤いボタン</span>で削除して下さい</th>
      </tr>
    </table>

    <table class="explanation">
      <tr>
        <h3>グラフについて</h3>
      </tr>
      <tr>
        <th>Ⅰ.&emsp;&emsp;一番上の丸いノードには、タイトルが表示されます</th>
      </tr>
      <tr>
        <th>Ⅱ.&emsp;&emsp;見出し1は丸みが小さい角丸長方形で表示されます</th>
      </tr>
      <tr>
        <th>Ⅲ.&emsp;&emsp;見出し2は丸みが大きい角丸長方形で表示されます</th>
      </tr>
      <tr>
        <th>Ⅳ.&emsp;&emsp;見出し3は左が凹んでいる形で表示されます</th>
      </tr>
      <tr>
        <th>Ⅴ.&emsp;&emsp;色が似ているものでグループ分けされ、下に行くにつれ色が濃くなります</th>
      </tr>
    </table>
    <br>
    <div id="trans" class="explanation">
      <router-link to="/about-trackpad">
        <span class="material-symbols-outlined" style="font-size: 32px;">trackpad_input</span>
        <span>ポップアップ表示時のトラックパッド操作についてはこちらから</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
  table th{
    border-bottom: 1px solid #00b563;
    padding: 20px 90px;
    text-align: left;
  }

  .explanation{
    margin-bottom: 70px;
  }

  .about a{
    display: flex;
    align-items:flex-end;

    gap: 20px;
    color: black;
    text-decoration: none;
    border-bottom: 1px solid #00b563;
  }

  
</style>