import React, { useState, useEffect } from 'react';

function App() {
  const [foodList, setFoodList] = useState([]); // State to hold the list of food items
  const [foodForm, setFoodForm] = useState({ name: '', quantity: '', expiration: '' }); // State for the form fields

  // Fetching existing food list from the API on component mount
  useEffect(() => {
    fetchFoodList(); // Fetching the data on initial load
  }, []);

  // Function to handle form submission and add a new food item
  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending a POST request to the API to add a new food item
      await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodForm),
      });
      setFoodForm({ name: '', quantity: '', expiration: '' }); // Reset the form after submission
      fetchFoodList(); // Reload the list of food items after adding a new one
    } catch (error) {
      console.error('Error adding food:', error); // Log any errors
    }
  };

  // Function to delete a food item
  const handleFoodDelete = async (id) => {
    try {
      // Sending a DELETE request to the API to remove the food item
      await fetch(`/api/food/${id}`, {
        method: 'DELETE',
      });
      fetchFoodList(); // Reload the food list after deletion
    } catch (error) {
      console.error('Error deleting food:', error); // Log any errors
    }
  };

  // Function to handle form input changes and update the foodForm state
  const handleFoodInputChange = (e) => {
    setFoodForm({ ...foodForm, [e.target.name]: e.target.value });
  };

  // Function to edit an existing food item
  const handleFoodEdit = async (id, updatedFood) => {
    try {
      // Sending a PUT request to the API to update the food item
      await fetch(`/api/food/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFood),
      });
      fetchFoodList(); // Reload the food list after editing the item
    } catch (error) {
      console.error('Error updating food:', error); // Log any errors
    }
  };

  // Function to fetch and load the list of food items
  const fetchFoodList = () => {
    fetch('/api/food')
      .then((res) => res.json()) // Parse the response as JSON
      .then((data) => setFoodList(data)) // Update the state with the fetched data
      .catch((error) => {
        console.error('Error fetching food list:', error); // Log any errors that occur during fetching
      });
  };

  return (
    <div style={{ backgroundColor: '#bccf90', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>Food Fresh</h1>

      {/* Display Food Cards */}
      <div className="food-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {foodList.map((food) => (
          <div key={food.id} style={{ width: '25%', border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f6a09a', margin: '22px' }}>
            <h3>{food.name}</h3>
            <p>Quantity: {food.quantity}</p>
            <p>Expiration: {food.expiration}</p>

            {/* Button Container with gap */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => {
                  const input = prompt(
                    'Enter New Name, Quantity, and Expiration',
                    `${food.name}, ${food.quantity}, ${food.expiration}`
                  );
                  if (input) {
                    const [newName, newQuantity, newExpiration] = input.split(',').map(field => field.trim());
                    handleFoodEdit(food.id, {
                      ...food,
                      name: newName || food.name,
                      quantity: newQuantity || food.quantity,
                      expiration: newExpiration || food.expiration,
                    });
                  }
                }}
              >
                Update Food
              </button>
              <button onClick={() => handleFoodDelete(food.id)}>Delete Food</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form to Add New Food */}
      <div>
        <h4 style={{ color: 'white' }}>Add New Food</h4>
        <form onSubmit={handleFoodSubmit}>
          <div>
            <input
              type="text"
              id="name"
              name="name"
              value={foodForm.name}
              onChange={handleFoodInputChange}
              placeholder="Name"
              required
            />
          </div>
          <div>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={foodForm.quantity}
              onChange={handleFoodInputChange}
              placeholder="Quantity"
              required
            />
          </div>
          <div>
            <input
              type="text"
              id="expiration"
              name="expiration"
              value={foodForm.expiration}
              onChange={handleFoodInputChange}
              placeholder="Expiration"
              required
            />
          </div>
          <button type="submit">Add</button>
        </form>
      </div>

    </div>
  );
}

export default App;
