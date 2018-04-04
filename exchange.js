/*

{
  { 
    bid: 10.01,
    size: 102
  },
  {
  
  }
}

*/

function Book() {
    var parent = this;
    this.bids = [];
    this.asks = [];
    this.last;
    this.onChange = function(pre) {
      if(!parent.last) {
        parent.last = pre;
        return;
      }
      var direction = pre > parent.last ? '▲' : (pre < parent.last ? '▼' : (pre == parent.last ? '■' : undefined));
      parent.last = pre;
      console.log(direction + ' '+pre);
    };
    
    /*k
    Executes saorder on exchange
    */
    this.execute = function(type, price, size) {
      
      //sell, you look at bids, and work from 0 to endIx (e.price >= price)
      //buy, you look at asks, and work from ix (e.price <= price) to end of list (length)
      
      var directionArr;
      var ix;
      var ex;
      var cx;
      var clm = 0;
      
      var uEX;
      var uIX;
      
      if (type == "sell") {
        /*directionArr = price ? parent.bids.each(function(x) {
          return x.price >= price : parent.bids;
        });
        */
        directionArr = parent.bids;
        uIX = function() { ix = 0; };
        uEX = function() {
          if(ix != undefined) ex = undefined;          
          parent.bids.forEach(function(e, i) { 
            if(e.price >= price) ex = i;
          });
        };  
        uIX();
        uEX();
      } else if (type == "buy") {
        /*
        directionArr = price ? parent.asks.each(function(x) {
          return x.price <= price;
        }) : parent.asks;
        */
        directionArr = parent.asks;
        uIX = function() {
          if(ix != undefined) ix = undefined;
          parent.asks.forEach(function(e, i){ 
            if(e.price <= price) ix = i;
          });
        };
        uEX = function() {
          ex = parent.asks.length - 1;
        };
        
        uIX();
        uEX();
      }
      
      if (ex < ix) {
        console.log('no orders found');
        return;
      }
      cx = ix;
      
      
      //BID: 10.3, 10.2, 10.12, 10.10, 10.07
      //ASK: 10.49, 10.42, 10.4, 10.25
      
      //sell(10.10) => directionArr[i].price >= price, 10.10, 10.07
      //buy(10.40) => directionArr[i].price <= price, 10.40, 10.25
      
      //ix>=0 && ix<= length -1 && clm < size
      
      
      if (directionArr == undefined || ix == undefined || ex == undefined) {
        console.log('invalid params');
        return;
      }
                                                 
      while(clm < size && (cx >= ix && cx <= ex)) {
        if(directionArr.length == 0){
          console.log('clm: '+clm);
          break;
        }
        //for the current bid, do I have enougah size?
        //200 >= 220
        var ixs = 0;
        while(clm < size && (ixs >= 0 && ixs < directionArr[cx].collection.length)){
          //0 + 200 <= 200
          //0 + 200 <= 220;
          
          //(2): 200 + 200 <= 220
          // 200+220sg
          //
          if(clm + directionArr[cx].collection[ixs] <= size) {         
            clm += directionArr[cx].collection[ixs];
            directionArr[cx].collection.splice(ixs, 1);   
          } else {        
            var diff = size - clm;
            clm += diff;
            directionArr[cx].collection[ixs] -= diff;
          } 
          ixs++;
        }
        if(directionArr[cx].collection.length == 0) {
          directionArr.splice(cx, 1);
          uIX();
          uEX(); 
          cx = ix;
        } else{
          cx++;
        }
      }     
      parent.onChange(price);
      
      return size - clm;
    };   
    /*
      places an order on the exchangesy
    */
    this.place = function(type, price, size) {    
      
      var directionExpression = function(e) { return e.price <= price; };
      var directionArr = type == "buy" ? parent.bids : (type == "sell" ? parent.asks : undefined);
      
      if(!directionArr) {
        return;
      }
      

           
      //sdump on the bid, no need to add to order book, pocket the change
      if(type == "sell") {
        if(parent.bids.length > 0 && parent.bids[0].price >= price) {
          var pocket = parent.bids[0].price - price;
          console.log('pocket: '+ pocket);
          size = parent.execute("sell", price, size);
        }
      } else if (type == "buy") {
        if(parent.asks.length > 0 && parent.asks[parent.asks.length - 1].price <= price) {
          var pocket = parent.asks[parent.asks.length - 1].price - price;
          console.log('pocket: '+ pocket);
          size = parent.execute("buy", price, size);
        }
      }
      
      if (size == 0) return;
      
      //add to the book dy
      var rtr = {
        'price': price,
        'collection': [size]
      };

      if(directionArr.length == 0) {
        directionArr.push(rtr);
      } else {
        var ix = 0;

        ix = directionArr.findIndex(directionExpression);

        if(ix == -1) {
          if(type =="buy" && directionArr[0].price > price) {
            directionArr.splice(directionArr.length, 0, rtr);
          } else if (type == "sell" && price < directionArr[0].price) {
            directionArr.splice(directionArr.length, 0, rtr);
          }
        }
        else if(ix >= 0) {
          if(directionArr[ix].price == price) {
            directionArr[ix].collection.push(size);
          } else {
            directionArr.splice(ix, 0, rtr);
          }  
        }
      }
      
  };
}


var b = new Book();
//sssaasssddtdsj
b.place("buy", 10.01, 102);
b.place("buy",10.01, 102);
b.place("buy",10.07, 500);
b.place("buy",9.89, 200);
b.place("buy",9.82, 300);
b.place("buy",10.1, 200);
b.place("buy",10.2, 200);
b.place("buy",10.12, 200);
b.place("buy",9.78, 200);
b.place("buy",10.3, 20);

b.place("sell",10.4, 102);
b.place("sell",10.42, 200);
b.place("sell",10.49, 200);
b.place("sell",10.4, 100);
b.place("sell",10.25, 10);
b.place("sell",10.25, 10);

//10.30 bid should be gone

b.place("sell", 10.18, 500);

//sell, you look at bids, and work from 0 to endIx (e.price >= price)
//buy, you look at asks, and work from ix (e.price <= price) to end of list (length)

//10.2 bid should be gone, 10.18 300 ASK

b.place("buy", 10.18, 550);

//10.18 ask should be gone, with 10.18 250 on the bid

b.place("sell", 2.00, 10000);

//all bids gone

//10.2 +200 a
//10.18 -500, ==> 10:18 -300
//10.18 +500, ==> 10:18 200
//trend random directionsfs
//trend direction mdisnutesss
//trend volatility indexd

console.log(b);
