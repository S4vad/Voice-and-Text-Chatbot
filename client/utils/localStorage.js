const USER_KEY = 'user';

export const getUserFromStorage=() =>{
  const user =localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) :null;
}


export const setUserToStorage=(user)=>{
  localStorage.setItem(USER_KEY,JSON.stringify(user))
}


export const removeUserFromStorage=()=>{
  localStorage.removeItem(USER_KEY)
}