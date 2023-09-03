import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [groupOpenStatus, setGroupOpenStatus] = useState([]);
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
        console.log(`Data ==> `, data);
        const groupedData =
          Array.isArray(data) && data.filter((ele) => !ele.isGroupNode);

        const openStatus =
          Array.isArray(data) &&
          data.reduce((acc, current) => {
            if (current.groupId) {
              const groupIds = String(current.groupId).split(',');
              groupIds.forEach((id) => {
                if (!acc.find((ele) => ele.groupId === id)) {
                  acc.push({
                    groupId: id,
                    isOpened: false,
                  });
                }
              });
            }
            return acc;
          }, []);
        setGroupOpenStatus(() => {
          return [...openStatus];
        });
        tableDataRef.current.tableData = data;
        tableDataRef.current.groupedData = groupedData;
      });
  }, []);

  console.log(`GroupOpened Status ==> `, groupOpenStatus);

  const isGroupOpened = (groupId) => {
    const groupIds = groupId ? String(groupId).split(',') : [];
    const selectedGroupId = groupIds[groupIds.length - 1] ?? null;
    return (
      groupOpenStatus.find((ele) => ele.groupId === selectedGroupId)
        ?.isOpened ?? false
    );
  };

  const openGroupContent = (groupId) => {
    const groupIds = groupId ? String(groupId).split(',') : [];
    const selectedGroupId = groupIds[groupIds.length - 1] ?? null;
    setGroupOpenStatus((current) =>
      current.map((groupEle) => {
        return {
          ...groupEle,
          isOpened:
            groupEle.groupId === selectedGroupId
              ? !groupEle.isOpened
              : groupEle.isOpened,
        };
      })
    );
  };

  const getGroupContent = (groupId) => {
    const groupIds = groupId ? String(groupId).split(',') : [];
    const selectedGroupId = groupIds[groupIds.length - 1] ?? null;
    // const groupContent = Array.isArray(tableDataRef.current.tableData)
    //   ? tableDataRef.current.tableData.filter(
    //       (dataEle) =>
    //         dataEle.isGroupNode &&
    //         String(dataEle.groupId).includes(selectedGroupId)
    //     )
    //   : [];
    const isNested = groupIds.length > 1;
    const groupContent = Array.isArray(tableDataRef.current.tableData)
      ? tableDataRef.current.tableData.filter((dataEle) =>
          dataEle.isGroupNode && isNested
            ? String(dataEle.groupId) === selectedGroupId
            : String(dataEle.groupId).includes(selectedGroupId)
        )
      : [];
    console.log(`Filtered Group Content ===> `, groupContent);
    return (
      groupContent.length &&
      groupContent.map((contentRow, contentRowIndex) => (
        <React.Fragment key={`${groupId}-row-${contentRowIndex}`}>
          <tr>
            <td>
              {contentRow.isGroupRoot ? (
                <span onClick={(e) => openGroupContent(contentRow.groupId)}>
                  {isGroupOpened(contentRow.groupId) ? <>👆</> : <>👇</>}
                </span>
              ) : null}
            </td>
            {tableColumns.map((column, colIndex) => (
              <td key={`${groupId}-col-${colIndex}`}>
                {contentRow[column.node]}
              </td>
            ))}
          </tr>
          {contentRow.groupId !== selectedGroupId &&
          isGroupOpened(contentRow.groupId)
            ? getGroupContent(contentRow.groupId)
            : null}
          {/* <tr>
            <td colSpan="4">
              {contentRow.groupId}
            </td>
          </tr> */}
        </React.Fragment>
      ))
    );
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
                      <span onClick={(e) => openGroupContent(row.groupId)}>
                        {isGroupOpened(row.groupId) ? <>👆</> : <>👇</>}
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
