import React, { useState, useEffect } from "react";
import { useTable, useSortBy, useFilters } from "react-table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./table.css";

const Table = () => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // Track the selected category

  useEffect(() => {
    fetchData();
  }, []);

  const customCategoryFilter = ({ column, filterValue, onChange }) => {
    const categories = [...new Set(tableData.map((item) => item.category))];

    return (
      <select
        onChange={(e) => {
          onChange(e.target.value);
          setSelectedCategory(e.target.value); // Update the selected category
        }}
        value={filterValue || ""}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    );
  };

  // Filter function to filter data based on the selected category
  const categoryFilterFunction = (rows, id, filterValue) => {
    if (filterValue === "") {
      return rows;
    }
    return rows.filter((row) => row.values[id] === filterValue);
  };

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/items");
      const data = await response.json();
      setTableData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updatePrice = async (id, newPrice) => {
    const updatedData = tableData.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          price: newPrice,
        };
      }
      return item;
    });
    setTableData(updatedData);
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:3000/api/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
      });
      if (response.ok) {
        console.log("Data saved successfully!");
        await fetchData();
        UpdateSuccessfulToast();
        setIsSaving(false);
      } else {
        console.error("Error saving data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ cell }) => (
          <img
            src={cell.row.original.image}
            alt={cell.row.original.name}
            width="50"
            height="50"
          />
        ),
      },
      {
        Header: "Category",
        accessor: "category",
        Filter: customCategoryFilter,
        filter: categoryFilterFunction, // Use the custom filter function
      },
      {
        Header: "Label",
        accessor: "label",
      },
      {
        Header: "Price",
        accessor: "price",
        Cell: ({ cell }) => (
          <input
            type="number"
            value={cell.value}
            onChange={(e) => updatePrice(cell.row.original.id, e.target.value)}
          />
        ),
      },
      {
        Header: "Description",
        accessor: "description",
      },
    ],
    [tableData]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: tableData,
        initialState: {
          sortBy: [{ id: "price", desc: false }],
        },
      },
      useFilters,
      useSortBy
    );

  const UpdateSuccessfulToast = () => {
    console.log("Showing toast");
    toast.success("Update successful!", {
      autoClose: 5000,
    });

    return (
      <div>
        <h1>Update successful!</h1>
      </div>
    );
  };

  return (
    <div>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : isSaving ? (
        <div className="saving">Saving...</div>
      ) : (
        <>
          <ToastContainer />
          <div className="filter-container">
            <label htmlFor="categoryFilter">Filter by Category:</label>
            <select
              id="categoryFilter"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="">All Categories</option>
              {Array.from(new Set(tableData.map((item) => item.category))).map(
                (category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
          <table className="custom-table" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="table-header"
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " ↓"
                            : " ↑"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows
                .filter((row) =>
                  selectedCategory
                    ? row.original.category === selectedCategory
                    : true
                ) // Filter based on selected category
                .map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="table-row">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="table-cell">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <button onClick={saveChanges} className="save-button">
            Save
          </button>
        </>
      )}
    </div>
  );
};

export default Table;
