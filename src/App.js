import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

export default function App() {
  const [groupOpenStatus, setGroupOpenStatus] = useState(null);
  const [groupNodes, setGroupNodes] = useState(null);

  console.log(`GroupOpened Status ==> `, groupOpenStatus);
  console.log(`GroupNodes ==> `, groupNodes);

  const tableDataRef = useRef({
    tableData: [],
    groupedData: [],
  });
  const tableColumns = [
    {
      node: 'organization',
      header: 'Organization',
    },
    {
      node: 'player_name',
      header: 'Player Name',
    },
    {
      node: 'game_score',
      header: 'Game Score',
    },
  ];

  const getLastIdAfterComma = (groupId) => {
    const ids = String(groupId)
      .split(',')
      .map((ele) => ele.trim());
    return ids[ids.length - 1];
  };

  const formatTableData = (tableData) => {
    const openStatus = {};
    const groupNodes = {};
    tableData.forEach((data) => {
      if (data.groupId) {
        const groupIds = String(data.groupId).split(',');
        groupIds.forEach((id) => {
          openStatus[id] = false;
          groupNodes[id] = tableData.filter((filterEle) => {
            if (filterEle.groupId && filterEle.groupId.includes(id)) {
              if (
                (filterEle.groupId.includes(',') &&
                  id !== getLastIdAfterComma(filterEle.groupId)) ||
                (!filterEle.groupId.includes(',') &&
                  filterEle.isGroupNode &&
                  id === getLastIdAfterComma(filterEle.groupId))
              ) {
                return true;
              }
              return false;
            }
            return false;
          });
        });
      }
    });
    setGroupOpenStatus(openStatus);
    setGroupNodes(groupNodes);
  };

  useEffect(() => {
    fetch('/formData.json')
      .then((res) => res.json())
      .then((data) => {
        console.log(`Data ==> `, data);
        const groupedData =
          Array.isArray(data) && data.filter((ele) => !ele.isGroupNode);
        formatTableData(data);
        tableDataRef.current.tableData = data;
        tableDataRef.current.groupedData = groupedData;
      });
  }, []);

  const isGroupOpened = (groupId) => {
    const selectedGroupId = getLastIdAfterComma(groupId);
    return groupOpenStatus[selectedGroupId] || false;
  };

  const toggleGroupContent = (groupId) => {
    const selectedGroupId = getLastIdAfterComma(groupId);
    setGroupOpenStatus((prevStatus) => ({
      ...prevStatus,
      [selectedGroupId]: !prevStatus[selectedGroupId],
    }));
  };

  const getGroupContent = (groupId) => {
    const id = getLastIdAfterComma(groupId);
    return groupNodes[id].map((contentRow, contentRowIndex) => (
      <React.Fragment key={`${id}-row-${contentRowIndex}`}>
        <tr
          className={`table-row ${
            contentRow.isGroupRoot ? 'group-root' : 'group-node'
          }`}
        >
          <td>
            {contentRow.isGroupRoot ? (
              <span
                className={`action-icon`}
                onClick={(e) => toggleGroupContent(contentRow.groupId)}
              >
                {isGroupOpened(contentRow.groupId) ? <>▼</> : <>▶</>}
              </span>
            ) : null}
          </td>
          {tableColumns.map((column, colIndex) => (
            <td key={`col-${colIndex}`}>{contentRow[column.node]}</td>
          ))}
        </tr>
        {contentRow.groupId !== id && isGroupOpened(contentRow.groupId)
          ? getGroupContent(contentRow.groupId)
          : null}
      </React.Fragment>
    ));
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-dark">
          <thead>
            <tr>
              <th scope="col"></th>
              {tableColumns.map((column, colIndex) => (
                <th key={`col-${colIndex}`}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableDataRef.current.groupedData.map((row, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                <tr
                  className={`table-row ${
                    row.isGroupRoot ? 'group-root' : 'group-node'
                  }`}
                >
                  <td>
                    {row.isGroupRoot ? (
                      <span
                        className={`action-icon`}
                        onClick={(e) => toggleGroupContent(row.groupId)}
                      >
                        {isGroupOpened(row.groupId) ? <>▼</> : <>▶</>}
                      </span>
                    ) : null}
                  </td>
                  {tableColumns.map((column, colIndex) => (
                    <td key={`col-${colIndex}`}>{row[column.node]}</td>
                  ))}
                </tr>
                {isGroupOpened(row.groupId)
                  ? getGroupContent(row.groupId)
                  : null}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
