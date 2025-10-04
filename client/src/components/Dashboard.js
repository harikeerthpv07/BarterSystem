import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Dashboard.css";
import AboutMe from "../components/AboutMe";
import HowToUse from "../components/HowToUse";


export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newItem, setNewItem] = useState({ title: "", description: "" });
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [receivedOffers, setReceivedOffers] = useState([]);
const [sentOffers, setSentOffers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token); // use jwt decode library
      setCurrentUserId(decoded.id);
    }
  }, []);

  // Fetch available items
  const fetchItems = async () => {
    try {
      const res = await API.get("/items");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch received offers
  const fetchOffers = async () => {
  try {
    // Offers received (made to my items)
    const resReceived = await API.get("/offers/received");
    setReceivedOffers(resReceived.data);

    // Offers sent (made by me)
    const resSent = await API.get("/offers/sent");
    setSentOffers(resSent.data);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchItems();
    fetchOffers();
  }, []);

  // Handle new item form change
  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/items", newItem);
      setMessage(res.data.message);
      setNewItem({ title: "", description: "" });
      fetchItems(); // refresh list
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add item");
    }
  };
  // Accept an offer
const handleAccept = async (offerId) => {
  try {
    await API.post(`/offers/${offerId}/accept`);
    fetchOffers(); // refresh list
    fetchItems();  // refresh items to show exchanged status
  } catch (err) {
    console.error(err);
  }
};

// Reject an offer
const handleReject = async (offerId) => {
  try {
    await API.post(`/offers/${offerId}/reject`);
    fetchOffers(); // refresh list
  } catch (err) {
    console.error(err);
  }
};
const handleOffer = async (itemId) => {
  // Ask user which of their own items they want to offer
  const offeredItemId = prompt("Enter your item ID to offer:");
  if (!offeredItemId) return;

  try {
    await API.post("/offers", { item_id: itemId, offered_item_id: offeredItemId });
    alert("Offer sent!");
    fetchOffers(); // refresh received offers
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Failed to send offer");
  }
};
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token"); // remove JWT
        navigate("/login");               // redirect to login page
    }   

  };



  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <AboutMe />
      <br/>
      <HowToUse />
      <br/>
      <button onClick={handleLogout} style={{ 
    backgroundColor: 'red'}} >Logout</button>

      <h3>Add Item</h3>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newItem.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newItem.description}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Item</button>
      </form>
      {message && <p>{message}</p>}

<h3>Available Items</h3>
<ul>
  {items
    .filter((item) => item.user_id !== currentUserId) // filter out your own items
    .map((item) => (
      <li key={item.id}>
        <strong>ID: {item.id}</strong> | {item.title} - {item.description} (Owner: {item.user_id})
        {currentUserId && item.user_id !== currentUserId && (
          <button onClick={() => handleOffer(item.id)}>Offer</button>
        )}
      </li>
    ))}
</ul>

    <h3>My Items</h3>
<ul>
  {items
    .filter((item) => item.user_id === currentUserId)
    .map((item) => (
      <li key={item.id}>
        <strong>ID: {item.id}</strong> | {item.title} - {item.description} | Status: {item.status}
      </li>
    ))}
</ul>



<h3>Offers</h3>

<h4>Received Offers</h4>
<ul>
  {receivedOffers.map((offer) => (
    <li key={offer.id}>
      Offer ID: {offer.id} | Your Item: {offer.item_title} | Offered Item: {offer.offered_item_title} | Status: {offer.status}
      {offer.status === "pending" && (
        <>
          <button onClick={() => handleAccept(offer.id)}>Accept</button>
          <button onClick={() => handleReject(offer.id)}>Reject</button>
        </>
      )}
    </li>
  ))}
</ul>


<h4>Sent Offers</h4>
<ul>
  {sentOffers.map((offer) => (
    <li key={offer.id}>
      Offer ID: {offer.id} | Your Item: {offer.offered_item_title} | Other's Item: {offer.item_title} | Status: {offer.status}
    </li>
  ))}
</ul>




    </div>
  );
}
