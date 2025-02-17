// We'll run and load the collection after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    fetch("../data/collection.json")
        .then((response) => response.json())
        .then((data) => {
            // Selects the search bar
            const searchInput = document.querySelector("#search-bar input");
            // When the user types in the search bar, it will filters the items in both grid and list view in any of the category
            searchInput.addEventListener("input", () => filterCollection(data));

            // First load of the collection
            loadCollection(data, "grid");

            const switchView = document.getElementById("grid-list-toggle");
            const gridBtn = document.getElementById("grid-view");
            const listBtn = document.getElementById("list-view");

            // Switches grid to list view and vice versa
            switchView.addEventListener("click", () => {
                gridListToggle();
                filterCollection(data);
            });

            // If pass, we'll also create a function in which toggles between grid and list view
            const gridListToggle = () => {
                gridBtn.classList.toggle("active");
                listBtn.classList.toggle("active");

                if (gridBtn.classList.contains("active")) {
                    loadCollection(data, "grid");
                } else {
                    loadCollection(data, "list");
                }
            };
        })
        .catch((error) => console.error("Error loading JSON:", error));
});

// Search bar for filtering the collection
// =============================================================================
const filterCollection = (data) => {
    const query = document
        .querySelector("#search-bar input")
        .value.toLowerCase();

    // with the data, each of the item values would be checked since we want the search bar to search everything
    // we'll filter all the items not related to what is typed in the search bar
    const filteredData = data.filter((item) =>
        Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(query)
        )
    );

    // We'll load the collection with that filtered data
    // It's also will return the view in the right grid or list view
    loadCollection(
        filteredData,
        document.getElementById("grid-view").classList.contains("active")
            ? "grid"
            : "list"
    );
};

// Here we will start loading the collection ONLY if it pass the check of loading the collection.json.
// =============================================================================
const loadCollection = (data, view) => {
    // Loading each item from the collection / json
    // ===========================================================================
    // HERE WILL BE SOME KIND OF SECURITY TO DOUBLE CHECK OF THE FILE WE LOOKING THROUGH IS RIGHT DATA OR SOMETHING IDK XD

    // Selects the collection-items element
    const collectionItemsSection = document.getElementById("collection-items");
    // Clear previous content
    collectionItemsSection.innerHTML = "";

    // If list view otherwise we'll default to grid view
    // We can also add an error if it's not list or grid somehow, but for now we are going to expect it to be right
    // The reason why we are doing the following this way as we want to create elements not strings
    // Wether it grid or list view, Each one when clicked, there will be a popup that shows more information about that clicked item
    // list-view
    if (view === "list") {
        // Creates the table and then the header elements
        const table = document.createElement("table");
        table.classList.add("list-view");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // We can make this automatic in the later sprints
        // We are assuming the order of the json have no "human error" order we will set each of the headers and also set which one will be sortable
        const headers = [
            { text: "Image", key: "image", sortable: false },
            { text: "Genus", key: "genus", sortable: true },
            { text: "Species", key: "species", sortable: true },
            { text: "Number", key: "number", sortable: true },
            { text: "Nickname", key: "nickname", sortable: true },
            { text: "Fossil Number", key: "fossil_number", sortable: true },
            { text: "Founder", key: "founder", sortable: true },
            { text: "Where Found", key: "where_found", sortable: true },
            { text: "What Was Found", key: "what_was_found", sortable: true },
            { text: "Company", key: "company", sortable: true },
            { text: "Company ID", key: "company_id", sortable: true },
        ];

        // Default settings for the sorting thing :D
        let currentSortColumn = null;
        let currentSortOrder = "asc";

        // For each of the headers, we'll create Text for us to see,
        // then the keys and sortable will be for the code to run and order
        headers.forEach(({ text, key, sortable }) => {
            const th = document.createElement("th");
            th.textContent = text;

            // If the header is sortable, user can click it to run the function to sort it
            if (sortable) {
                th.classList.add("sortable");
                th.addEventListener("click", () => sortTable(key));
            }

            headerRow.append(th);
        });

        // Head of the table is now done and appended
        thead.append(headerRow);
        table.append(thead);

        // Table body time :)
        const tbody = document.createElement("tbody");

        // Function that for each data, we'll add them into rows with there data
        const populateTable = (data) => {
            // We'll clear the table body each time since when sorting, we will be loading the sorted list so we will want to clear :D
            tbody.innerHTML = "";

            // For each item, we'll create the row with the data of that item
            data.forEach((item) => {
                const row = document.createElement("tr");

                // image first in the row cause idk, I want to XD
                const imgCell = document.createElement("td");
                const img = document.createElement("img");
                img.src = item.image || "../img/img-not-found.png";
                img.alt = "Image Not Found";
                img.classList.add("table-img");
                imgCell.append(img);
                row.append(imgCell);

                // We now add the other data other than the image of course :D
                headers.slice(1).forEach(({ key }) => {
                    const td = document.createElement("td");
                    td.textContent = item[key] || "-";
                    row.append(td);
                });

                // Each row will be clickable to show the popup of that clicked item
                row.addEventListener("click", () => showItemPopup(item));

                // Now we append the row to the body
                tbody.append(row);
            });

            // Body is now done, append it to the table
            table.append(tbody);
        };

        // Function to sort table basically, it'll pass the column the user clicked
        const sortTable = (columnKey) => {
            // If the clicked column was already in an order, we'll reverse the order
            if (currentSortColumn === columnKey) {
                currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
            }
            // Other wise, use default
            else {
                currentSortColumn = columnKey;
                currentSortOrder = "asc";
            }

            // Gets the data and sort it
            const sortedData = [...data].sort((a, b) => {
                let valA = a[columnKey] || "";
                let valB = b[columnKey] || "";

                // Checks if the vals is a number
                if (!isNaN(valA) && !isNaN(valB)) {
                    valA = Number(valA);
                    valB = Number(valB);
                }
                // Otherwise it's a string and we'll change it to lowercase for sorting :D
                else {
                    valA = valA.toString().toLowerCase();
                    valB = valB.toString().toLowerCase();
                }

                // checks which order of the currentSortOrder is,
                // asc, larger values go down and smaller goes up
                // desc, larger values go up and smaller goes down
                if (currentSortOrder === "asc") {
                    if (valA > valB) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    if (valA < valB) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            });

            // Now with the sorted data, time to show it on the table
            populateTable(sortedData);
        };

        // First time, we'll load the data into the table by a default unsorted order
        populateTable(data);

        collectionItemsSection.append(table);
    }
    // grid-view
    else {
        // Create div element for the grid view
        const div = document.createElement("div");
        div.classList.add("grid-view");

        // For each item in the collection json we'll display the image and the formal name
        data.forEach((item) => {
            // Creating the button element
            const button = document.createElement("button");
            button.type = "button";
            button.classList.add("item");

            // Creating the image element
            const img = document.createElement("img");
            img.src = "../img/img-not-found.png";
            img.alt = "Image Not Found";

            // Creating the p element
            const p = document.createElement("p");
            p.textContent = item.formal_name;

            // appends the img and p to the button
            button.append(img);
            button.append(p);

            // Each button will have an event listener so show the popup with the extra information
            button.addEventListener("click", () => showItemPopup(item));

            // now we append the button to the collection-items element
            div.append(button);
        });

        collectionItemsSection.append(div);
    }

    // Popup Container for items
    // ===========================================================================
    // Here is the item-popup element
    const popupContainer = document.getElementById("item-popup");

    // Here shows the popup with the items information when someone clicks an item
    const showItemPopup = (item) => {
        // Clear previous content
        popupContainer.innerHTML = "";

        // Header
        const header = document.createElement("header");
        const title = document.createElement("h1");
        title.textContent = item.formal_name;

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.id = "close-popup";

        const closeImg = document.createElement("img");
        closeImg.src = "../svg/close.svg";
        closeImg.alt = "Close Button";

        closeButton.append(closeImg);
        header.append(title);
        header.append(closeButton);

        // Image
        const itemImg = document.createElement("img");
        itemImg.src = item.image || "../img/img-not-found.png";
        itemImg.alt = "Image Not Found";

        // Description
        const descriptionDiv = document.createElement("div");
        descriptionDiv.classList.add("popup-descriptions");
        const description = document.createElement("p");
        // Here is a loop that goes through each of the item key and value and add it as a p element

        Object.keys(item).forEach((key) => {
            // We can also set which keys we don't want like image for example since we used it somewhere else
            if (key !== "image") {
                const p = document.createElement("p");
                // Here we will replace the underscores into space for... better looking?
                // As well as making the first letter of each key word Cap :D
                // Example -> Formal Name: Tyrannosaurus Rex
                p.textContent = `${key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}: ${
                    item[key]
                }`;

                description.append(p);
            }
        });
        descriptionDiv.append(description);

        // Now we append the elements
        // Again, we did it this way for more control and also we want to create elements not strings
        popupContainer.append(header, itemImg, descriptionDiv);

        // Shows the popup
        popupContainer.classList.add("show");
        document.body.classList.add("no-scroll");
        // Close the popup when the close button is pressed
        closeButton.addEventListener("click", () => {
            popupContainer.classList.remove("show");
            document.body.classList.remove("no-scroll");
        });
    };
};
