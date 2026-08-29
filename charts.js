function fetchData(url, cb) { fetch(url).then(r=>r.json()).then(cb).catch(console.error); }
function formatNum(n) { if(n>=10000) return (n/10000).toFixed(1)+'万'; if(n>=1000) return (n/1000).toFixed(1)+'千'; return n; }

function loadKPI() {
    fetchData('/api/summary', d => {
        document.querySelector('#kpi-total-sales .kpi-value').textContent = formatNum(d.total_sales||0);
        document.querySelector('#kpi-total-revenue .kpi-value').textContent = '¥'+formatNum(d.total_revenue||0);
        document.querySelector('#kpi-records .kpi-value').textContent = formatNum(d.total_records||0);
        document.querySelector('#kpi-member-ratio .kpi-value').textContent = (d.avg_member_ratio||0).toFixed(1)+'%';
    });
}

function renderMonthly(data) {
    const chart = echarts.init(document.getElementById('monthlyChart'));
    chart.setOption({
        tooltip:{trigger:'axis'}, legend:{data:['销量','营收']},
        xAxis:{type:'category', data:data.map(d=>d.month), axisLabel:{rotate:30}},
        yAxis:[{type:'value',name:'销量'},{type:'value',name:'营收'}],
        series:[{name:'销量',type:'bar',data:data.map(d=>d.total_sales), itemStyle:{color:'#D4A574'}},
                {name:'营收',type:'line',yAxisIndex:1,data:data.map(d=>d.total_revenue), smooth:true, lineStyle:{color:'#8B5A2B',width:3}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderProductRank(data) {
    const chart = echarts.init(document.getElementById('productChart'));
    const sorted = data.slice(0,10).reverse();
    chart.setOption({
        tooltip:{trigger:'axis'}, grid:{left:'20%',right:'6%'},
        xAxis:{type:'value',name:'销量'}, yAxis:{type:'category',data:sorted.map(d=>d.product_name)},
        series:[{type:'bar',data:sorted.map(d=>d.total_sales), itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'#D4A574'},{offset:1,color:'#8B5A2B'}])}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderCityRank(data) {
    const chart = echarts.init(document.getElementById('cityChart'));
    chart.setOption({
        tooltip:{trigger:'axis'}, xAxis:{type:'category',data:data.map(d=>d.city), axisLabel:{rotate:30}},
        yAxis:{type:'value',name:'销量'},
        series:[{type:'bar',data:data.map(d=>d.total_sales), itemStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#8B5A2B'},{offset:1,color:'#D4A574'}])}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderSeason(data) {
    const chart = echarts.init(document.getElementById('seasonChart'));
    const colors=['#8BC34A','#FFB74D','#FF8A65','#4FC3F7'];
    chart.setOption({
        xAxis:{type:'category',data:data.map(d=>d.season)}, yAxis:{type:'value',name:'销量'},
        series:[{type:'bar',data:data.map((d,i)=>({value:d.total_sales,itemStyle:{color:colors[i%colors.length]}}))}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderCategory(data) {
    const chart = echarts.init(document.getElementById('categoryChart'));
    chart.setOption({
        tooltip:{trigger:'item',formatter:'{b}: {c} ({d}%)'},
        legend:{orient:'vertical',right:'5%',top:'center'},
        series:[{type:'pie',radius:['40%','70%'],center:['45%','50%'],data:data.map(d=>({name:d.category,value:d.total_sales})),itemStyle:{borderRadius:8,borderColor:'#fff',borderWidth:2}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderHeatmap(data) {
    const chart = echarts.init(document.getElementById('heatmapChart'));
    const {cities, products, matrix} = data;
    const heatData = [];
    for(let i=0;i<cities.length;i++) for(let j=0;j<products.length;j++) heatData.push([j,i,matrix[i][j]]);
    chart.setOption({
        tooltip:{position:'top', formatter:p=>products[p.value[0]]+'<br/>'+cities[p.value[1]]+'<br/>销量:'+p.value[2]},
        xAxis:{type:'category',data:products,splitArea:{show:true}, axisLabel:{rotate:30,fontSize:10}},
        yAxis:{type:'category',data:cities,splitArea:{show:true}},
        visualMap:{min:0,max:Math.max(...matrix.flat()),calculable:true,orient:'horizontal',left:'center',bottom:'0%',inRange:{color:['#f5e6d3','#D4A574','#8B5A2B']}},
        series:[{type:'heatmap',data:heatData,label:{show:true,fontSize:10,color:'#333'}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderHoliday(data) {
    const chart = echarts.init(document.getElementById('holidayChart'));
    chart.setOption({
        tooltip:{trigger:'axis', formatter:p=>{const d=data[p[0].dataIndex]; return d.type+'<br/>平均销量:'+d.avg_sales.toFixed(0)+'<br/>总销量:'+d.total_sales;}},
        xAxis:{type:'category',data:data.map(d=>d.type)}, yAxis:{type:'value',name:'平均销量'},
        series:[{type:'bar',data:data.map(d=>d.avg_sales), itemStyle:{color:p=>p.dataIndex===0?'#FF6B6B':'#4ECDC4'}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}
function renderCampaign(data) {
    const chart = echarts.init(document.getElementById('campaignChart'));
    chart.setOption({
        tooltip:{trigger:'axis'}, xAxis:{type:'category',data:data.map(d=>d.campaign||'无活动'), axisLabel:{rotate:20}},
        yAxis:{type:'value',name:'平均销量'},
        series:[{type:'bar',data:data.map(d=>d.avg_sales), itemStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#FFB74D'},{offset:1,color:'#FF8A65'}])}}]
    });
    window.addEventListener('resize', ()=>chart.resize());
}

function init() {
    loadKPI();
    fetchData('/api/monthly', renderMonthly);
    fetchData('/api/product_rank', renderProductRank);
    fetchData('/api/city_rank', renderCityRank);
    fetchData('/api/season', renderSeason);
    fetchData('/api/category_pie', renderCategory);
    fetchData('/api/city_product', renderHeatmap);
    fetchData('/api/holiday', renderHoliday);
    fetchData('/api/campaign', renderCampaign);
}
document.addEventListener('DOMContentLoaded', init);