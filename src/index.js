import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends React.Component{
  constructor(props){
    super(props);

    this.state={
      searchItem:'',
      result:''
    }
    this.search = this.search.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

handleChange =(e)=>{
  e.preventDefault();
  this.setState({
    searchItem: e.target.value
  })
}

search= async (e) =>{
  e.preventDefault();
  let data = {
    info:''
  }
  let response = await fetch('api/search',{method:'POST',body:JSON.stringify(this.state), headers:{
      'Content-Type':"application/json"
    }});
  data = await response.json();

  let deals = [];
  let jsxArr;

  for(let i = 0; i < data.info.length; i++){
    let currentObj = data.info[i];
    let arr = Object.entries(currentObj);
    jsxArr = arr.map((entry)=>{
      if(entry[0]=='url'){
        return <div className="col-16"><a href={entry[1]}><h5 className="search-items">Link</h5></a></div>;
      }
        return <div className="col-16"><h5 className="search-items">{entry[0]}: {entry[1]}</h5></div>;
    })
    deals.push(<div className="row">{jsxArr}</div>);
  }
    console.log(deals);
  this.setState({
    result: deals
  })
}

render(){
  return(<div>
    <div className="searchEngine">
      <form>
      <h2>Enter Search Item</h2>
      <input type="text" placeholder="Enter Item" onChange={this.handleChange} />
      <button onClick={this.search}>Search!</button>
      </form>
    </div>
    <div id="results">
      {this.state.result}
    </div>
  </div>)
}

}


ReactDOM.render(
    <App />,
  document.getElementById('root')
);
