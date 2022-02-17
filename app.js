
// const client = contentful.createClient({
//   // This is the space ID. A space is like a project folder in Contentful terms
//   space: "0k205crytdxx",
//   // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
//   accessToken: "mZBO-BpPSRROChvg5_BZbW955wV0wbTGr90BEes-mvU"
// });

// console.log(client)

//  set variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");
// cart
var cart = [];
// buttons
var buttonsDOM = [];

// product class
class Products{
 async getProduct() {
     try {

        // let contentful = await client.getEntries({content_type: 'comfyHouseProducts'});
        // console.log(contentful.items)
        //  let newData = contentful.items;

         let data = await fetch("products.json");
         let jData = await data.json();
         let newData = jData.items
         let distructedData = newData.map(list => {
             const {id} = list.sys;
             const {title, price} = list.fields;
             const img = list.fields.image.fields.file.url;
             return {title, price, id, img}
         })
         return distructedData;
     } catch (error) {
         console.log(error)
     }
 }
}

// ui class
class UI{

    // display products in dom
    display(inp){
        let indisplay = "";
        inp.forEach(el=> {
            indisplay += `
            <aside class="product">
                <div class="img-container">
                    <img src="${el.img}" class="product-img"/>
                    <button class="bag-btn" data-id=${el.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${el.title}</h3>
                <h4>$${el.price}</h4>
            </aside>
            ` 
            
        });
        productsDom.innerHTML = indisplay
    }

    // get all buttons

    getBtn(){
        var buttons = [...document.querySelectorAll(".bag-btn")]
        buttonsDOM = buttons;
        buttons.forEach(items=>{
            var id = items.dataset.id;
            var inCart = cart.find(el=> el.id === id);
            if(inCart){
                items.innerText = "in cart";
                items.disabled = true;
            }
            items.addEventListener('click', (event)=>{
                event.target.innerText = "in cart";
                event.target.disabled = true;
                // get product
                var product = {...Storage.getProduct(id), amount: 1};
                // add product to cart
                cart = [...cart, product] 
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart)
                // display cart items
                this.displayCartItems(product)
                // shw cart
                this.showCart()
            })
        })
    }
    setCartValues(cart){
        var totalPrice = 0;
        var totalProduct = 0;
        cart.forEach(items=>{
            totalPrice += items.price * items.amount;
            totalProduct += items.amount;
        })

        cartItems.innerText = totalProduct;
        cartTotal.innerText = parseFloat(totalPrice.toFixed(2))
    }
    displayCartItems(items){
        var div = document.createElement("div");
        // div.setAttribute('class', "cart-item")
        div.classList.add("cart-item")
        div.innerHTML = `<img src="${items.img}"/>
        <div>
            <h4>${items.title}</h4>
            <h5>$${items.price}</h5>
            <span class="remove-item" data-id= ${items.id}> remove</span>
        </div>
        <div >
            <i class="fas fa-chevron-up" data-id= ${items.id}></i>
            <p class="item-amount"> ${items.amount} </p>
            <i class="fas fa-chevron-down" data-id= ${items.id}></i>
        </div>`

        cartContent.appendChild(div);

            }
    showCart(){
        cartOverlay.classList.add("transparentBcg")
        cartDom.classList.add("showCart")
    }
     removeCart(){
        cartOverlay.classList.remove("transparentBcg")
        cartDom.classList.remove("showCart")
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart)
        // cartOverlay.addEventListener("click",(event)=> this.removeCart())
        cartBtn.addEventListener('click', (event)=>this.showCart())  
        closeCartBtn.addEventListener("click",(event)=> this.removeCart())
    }
    populateCart(cart){
        cart.forEach(item=>this.displayCartItems(item))
    }
    cartLogic(){
        // clear cart button
        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart()
        });
        // cart functionalty
        cartContent.addEventListener('click', (event)=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem =  event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItems(id);
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let temp = cart.find(items=>items.id === id);
                temp.amount = temp.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = temp.amount
            }else if(event.target.classList.contains('fa-chevron-down')){
                let removeAmount = event.target;
                let id = removeAmount.dataset.id;
                let temp = cart.find(items=>items.id === id);
                temp.amount = temp.amount - 1;
                if(temp.amount>0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    removeAmount.previousElementSibling.innerText = temp.amount
                }else{
                    cartContent.removeChild(removeAmount.parentElement.parentElement);
                    this.removeItems(id);
                }
            }
        })
    }
    clearCart(){
        let cartItems = cart.map(items=>{
            return items.id;
        })

        cartItems.forEach(id=>this.removeItems(id))

        while(cartContent.children.length>0){
             cartContent.removeChild(cartContent.children[0])
        }
        this.removeCart()
    }
    removeItems(id){
        cart = cart.filter(items => items.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart);
        var button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class='fas fa-shopping-cart'></i>add to cart`
    }
    getSingleButton(id){
        return buttonsDOM.find(btn => btn.dataset.id === id)
    }
}

// storage class
class Storage{
    static storeProduct(product){
        localStorage.setItem("items", JSON.stringify(product));
    }
    static getProduct(id){
        var products = JSON.parse(localStorage.getItem("items"));
        var product = products.find(products=> products.id === id);
        return product
    }
    static saveCart(cart){
        console.log(cart)
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem("cart")? JSON.parse(localStorage.getItem("cart")):[]
    }

}

// add event listener to the dom, after loading, DomContentLoader
document.addEventListener("DOMContentLoaded", ()=>{
    const products = new Products();
    const ui = new UI();
    // setup app
    ui.setupAPP()
    // get products
    products.getProduct().then(myApi =>{
        ui.display(myApi)
        Storage.storeProduct(myApi)
    }).then(()=>{
        ui.getBtn();
        ui.cartLogic();
    })

})
