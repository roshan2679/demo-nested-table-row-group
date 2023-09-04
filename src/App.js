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
                {isGroupOpened(contentRow.groupId) ? <>▲</> : <>▼</>}
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
                        {isGroupOpened(row.groupId) ? <>▲</> : <>▼</>}
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

// import React, { useEffect, useState, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

export function App2() {
  const [groupOpenStatus, setGroupOpenStatus] = useState({});
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
      node: 'name',
      header: 'Name',
    },
    {
      node: 'age',
      header: 'Age',
    },
  ];

  useEffect(() => {
    fetch('/formData.json')
      .then((res) => res.json())
      .then((data) => {
        const groupedData = data.filter((ele) => !ele.isGroupNode);

        const openStatus = {};
        data.forEach((current) => {
          if (current.groupId) {
            const groupIds = String(current.groupId).split(',');
            groupIds.forEach((id) => {
              openStatus[id] = false;
            });
          }
        });

        setGroupOpenStatus(openStatus);

        tableDataRef.current.tableData = data;
        tableDataRef.current.groupedData = groupedData;
      });
  }, []);

  console.log(groupOpenStatus);

  const isGroupOpened = (groupId) => {
    return groupOpenStatus[groupId] || false;
  };

  const toggleGroupContent = (groupId) => {
    setGroupOpenStatus((prevStatus) => ({
      ...prevStatus,
      [groupId]: !prevStatus[groupId],
    }));
  };

  const renderGroup = (groupId) => {
    const groupContent = tableDataRef.current.tableData.filter(
      (dataEle) => dataEle.isGroupNode && dataEle.groupId === groupId
    );
    console.log(groupContent);

    return groupContent.map((contentRow, contentRowIndex) => (
      <React.Fragment key={`${groupId}-row-${contentRowIndex}`}>
        <tr>
          <td>
            {contentRow.isGroupRoot ? (
              <span onClick={() => toggleGroupContent(contentRow.groupId)}>
                {isGroupOpened(contentRow.groupId) ? '👆' : '👇'}
              </span>
            ) : null}
          </td>
          {tableColumns.map((column, colIndex) => (
            <td key={`${groupId}-col-${colIndex}`}>
              {contentRow[column.node]}
            </td>
          ))}
        </tr>
        {({ contentRow, isGroupOpened, renderGroup }) => {
          const groupIds = contentRow.groupId
            ? String(contentRow.groupId).split(',')
            : [];
          const groupId = groupIds[groupIds.length - 1] ?? null;

          return groupId && isGroupOpened(contentRow.groupId) ? (
            <>{renderGroup(contentRow.groupId)}</>
          ) : null;
        }}
      </React.Fragment>
    ));
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-dark table-striped">
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
                <tr>
                  <td>
                    {row.isGroupRoot ? (
                      <span onClick={() => toggleGroupContent(row.groupId)}>
                        {isGroupOpened(row.groupId) ? '👆' : '👇'}
                      </span>
                    ) : null}
                  </td>
                  {tableColumns.map((column, colIndex) => (
                    <td key={`col-${colIndex}`}>{row[column.node]}</td>
                  ))}
                </tr>
                {({ row, isGroupOpened, renderGroup }) => {
                  const groupIds = row.groupId
                    ? String(row.groupId).split(',')
                    : [];
                  const groupId = groupIds[groupIds.length - 1] ?? null;
                  console.log('selected GroupId ==> ', groupId);
                  return groupId && isGroupOpened(row.groupId) ? (
                    <>{renderGroup(row.groupId)}</>
                  ) : null;
                }}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
