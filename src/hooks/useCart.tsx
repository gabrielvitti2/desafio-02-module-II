import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';


interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    
    try {

      const updatedCart = [...cart]

      const product = (await api.get(`/products/${productId}`)).data

      const productExist = updatedCart.find(product => product.id === productId)

      if (!product) {
        toast.error('Erro na adição do produto');
        return
      }

      const stockAmount = (await api.get(`/stock/${productId}`)).data.amount

      const currentAmount = productExist ? productExist.amount : 0

      const newAmount = currentAmount + 1

      if (newAmount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (productExist) {
        productExist.amount = newAmount
      } else {

        const newProduct = {
          ...product,
          amount: 1
        }

        updatedCart.push(newProduct)
      }

      setCart(updatedCart)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))


    } catch {
      toast.error('Erro na adição do produto');    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]

      const productExist = updatedCart.find(product => product.id === productId)

      if (!productExist) {

        toast.error('Erro na remoção do produto');
        return 

      } else {
        const newCart = updatedCart.filter(product => product.id != productId)
  
        setCart(newCart)
  
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))}
      
      

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount
  }: UpdateProductAmount) => {
    try {

      const updatedCart = [...cart]

      const productExist = updatedCart.find(product => product.id === productId)

      if (!productExist) {
        toast.error('Erro na alteração de quantidade do produto');
        return
       } else
        {


      if (amount <= 0) {
        return
      }
       else {

         const stockAmount = (await api.get(`/stock/${productId}`)).data.amount
   
           if (amount > stockAmount) {
             toast.error('Quantidade solicitada fora de estoque')
             return
           }
     
           const findProduct = updatedCart.find(product => product.id === productId)
     
           if (findProduct) {
             findProduct.amount = amount
           }
     
           setCart (updatedCart)
   
           localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

       }
      }
 
     
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };


  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
