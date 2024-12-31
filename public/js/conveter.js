
const dropdown = document.querySelectorAll(".drop select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

for (let select of dropdown ){
    for (curr in countryList){
        let newOption = document.createElement("option");
        newOption.innerText = curr;
        newOption.value = curr;
        if (select.name === "from" && curr === "USD") {
            newOption.selected = "selected";
        } else if (select.name === "to" && curr === "INR"){
            newOption.value.selected = "selected";
        }
        select.append(newOption);
    }

    select.addEventListener("change", (evt) =>{
        updateFlag(evt.target);
    })
}


const updateFlag = (element) =>{
    let curr = element.value;
    let country = countryList[curr];
    let newsrc = `https://flagsapi.com/${country}/shiny/64.png`;
    let image = element.parentElement.querySelector("img");
    image.src = newsrc;
}
 

async function fetchData() {
  let amount = document.querySelector(".amount input");
  let amtVal = amount.value;
  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }
  const get = fromCurr.value;
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_JLXDvLpDbtKNurx7Apsp093aYnvg2AjsZDEchZ8J&currencies=EUR%2CUSD%2CCAD%2CINR%2CJPY%2CBGN%2CCZK%2CDKK%2CGBP%2CHUF%2CPLN%2CRON%2CSEK%2CCHF%2CISK%2CNOK%2CHRK%2CRUB%2CTRY%2CAUD%2CBRL%2CCNY%2CHKD%2CIDR%2CILS%2CKRW%2CMXN%2CMYR%2CNZD%2CPHP%2CSGD%2CTHB%2CZAR&base_currency=${get}`;
  const response = await fetch(url);
  console.log(response);
  const data = await response.json();
  console.log(data);
  let rate = data.data[toCurr.value];
  console.log(rate);
  let finalAmount = amtVal * rate;
  msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
}



btn.addEventListener("click", (evt) => {
    evt.preventDefault();
   fetchData();
  });
  
  window.addEventListener("load", () => {
  // fetchData();
  });