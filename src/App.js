import { Button } from '@material-ui/core';
import {useEffect, useState} from 'react';
import './index.css';
import './App.css';
import { Table } from '@material-ui/core';
import { TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';


function App() {

  const [currency, setCurrency] = useState(1);
  const [pizzaPriceCurrency, setPizzaPriceCurrency] = useState("USD");
  const [guests, setGuests] = useState({});
  const [total, setTotal] = useState(0);
  const [moneyCollected, setMoneyCollected] = useState(0);
  const [isPizzaLoading, setIsPizzaLoading] = useState(true);
  const [isCurrencyLoading, setIsCurrencyLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // const [guestsShare, setGuestShare] = useState({});
  const fetchPizza = async (type, num) => {
    const pizza = await fetch(`https://gp-js-test.herokuapp.com/pizza/order/${type}/${num}`);
    return await pizza.json();
  }

  const fetchCurrency = async () => {
    const currency = await fetch('https://gp-js-test.herokuapp.com/pizza/currency');
    return await currency.json();
  }


  const go = async () => {
    document.getElementById('app').innerHTML = '';
    const res1 = await fetch('https://gp-js-test.herokuapp.com/pizza');
    const guests = await res1.json();
    const eatingPizzaGuests = guests.party.filter(chel => chel.eatsPizza === true);
    const names = [];
    eatingPizzaGuests.forEach( chel => {
      names.push(chel.name);
    });
    const allNames = names.join(',');
    const res2 = await fetch(`https://gp-js-test.herokuapp.com/pizza/world-diets-book/${allNames}`);
    const guestsDiet = await res2.json();
    const vegans = guestsDiet.diet.filter(chel => chel.isVegan === true);
    const perc = vegans.length / guestsDiet.diet.length;
    let pizzaType = "meat";
    if (perc >= 0.51) {
      const randNum = Math.random() % 2 + 1;
      if (randNum === 1) {
        pizzaType = "cheese";
      } else {
        pizzaType = "vegan"
      }
    }


    document.getElementById('pizza').innerHTML = '';
    // document.getElementById('participants').innerHTML = '';
    const pizza = document.getElementById('pizza');
    pizza.style =  `
        border-radius: 50%;
        width: 200px;
        height: 200px;
        overflow: hidden;
        background-color: rgb(255, 197, 71);
        position: relative;
      `;
    const ang = 360/eatingPizzaGuests.length;
    const containerElement = document.createElement("div");
    containerElement.style.height = "100%";
    containerElement.style.width = "100%";
    containerElement.style.backgroundColor = "rgb(255, 197, 71);";
    containerElement.style.position = "relative";
    for (let i = 0; i < eatingPizzaGuests.length; i++) {
      const cutElement = document.createElement("div");
      cutElement.style.position = "absolute";
      cutElement.style.transformOrigin = "center left"
      cutElement.style.left = "50%";
      cutElement.style.top = "50%";
      cutElement.style.height = "1px";
      cutElement.style.width = "50%";
      cutElement.style.backgroundColor = "#111111";
      cutElement.style.transform = `rotate(${(ang * i)}deg)`;
      containerElement.appendChild(cutElement);
    }
    document.getElementById("pizza").appendChild(containerElement);
    
    
    fetchPizza(pizzaType, guestsDiet.diet.length).then((pizza) => {
      const guestShareMap = {};
      const pizzaPriceCurrency = pizza.price.split(" ")[1];
      setPizzaPriceCurrency(pizzaPriceCurrency);
      const share = parseFloat(pizza.price)/eatingPizzaGuests.length;
      setTotal(parseFloat(pizza.price));
      eatingPizzaGuests.forEach(guest => {
        guestShareMap[guest.name] = share;
      })
      setGuests(guestShareMap);
      setIsPizzaLoading(false);
    });
    fetchCurrency().then(currency => {
      setCurrency(currency);
      setIsCurrencyLoading(false);
    });
  }

  const pay = (name) => {
    setMoneyCollected(moneyCollected + guests[name])
    guests[name] = 0;
    setGuests(guests);
  }

  useEffect(() => {
    if (!isCurrencyLoading && !isPizzaLoading) {
      setIsLoading(false);
    }
  }, [isCurrencyLoading, isPizzaLoading])

  return (
    <div className="App">
      <Button onClick={() => {
        setMoneyCollected(0);
        setIsLoading(true);
        setIsCurrencyLoading(true);
        setIsPizzaLoading(true);
        go();
      }} id='load-btn' variant="contained" color="primary" sx={{ display:'block' }}>Okaay Let's Go</Button>
      <div id="app"><p>Click 👆 this button</p></div>
        <div id="party" className="party">
          {
            isLoading && <div>Waiting...</div>
          }
          <div id='pizza' className='pizza'></div>
          {
            (!isCurrencyLoading && !isPizzaLoading) &&
            (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Share to Pay</TableCell>
                      <TableCell>Pay</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {
                    Object.keys(guests).map(name => {
                      return <TableRow height="20px">
                        <TableCell>{name}</TableCell>
                        <TableCell>{(guests[name] * currency["BYN"]/currency[pizzaPriceCurrency]).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" color="secondary" onClick={() => pay(name)} disabled={!guests[name]}>
                            {
                              guests[name] ? "pay" : "paid"
                            }
                          </Button>
                        </TableCell>
                        </TableRow>
                    })
                  }
                  <TableRow>
                    <TableCell>Total order</TableCell>
                    <TableCell>{(total * currency["BYN"]/currency[pizzaPriceCurrency]).toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Money to collect</TableCell>
                    <TableCell>{((total - moneyCollected) * currency["BYN"]/currency[pizzaPriceCurrency]).toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Money collected</TableCell>
                    <TableCell>{(moneyCollected * currency["BYN"]/currency[pizzaPriceCurrency]).toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  </TableBody>
                </Table>
            )
          }


      </div>
    </div>
  );
}

export default App;
