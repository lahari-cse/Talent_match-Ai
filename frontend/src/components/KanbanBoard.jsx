import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

const COLUMNS = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

const KanbanBoard = ({ initialApps }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const initialColumns = COLUMNS.reduce((acc, col) => {
      const statusToMatch = col === 'Wishlist' ? 'Saved' : col;
      acc[col] = initialApps.filter(app => (app.status || 'Applied') === statusToMatch);
      return acc;
    }, {});
    setColumns(initialColumns);
  }, [initialApps]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    
    const sourceItems = [...sourceCol];
    const destItems = [...destCol];

    const [removed] = sourceItems.splice(source.index, 1);
    removed.status = destination.droppableId; // update local status

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: sourceItems });
    } else {
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      });

      // Update backend
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs/applications/${draggableId}/status`, { status: destination.droppableId }, config);
      } catch (error) {
        console.error('Error updating status', error);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(colId => (
          <div key={colId} className="flex-1 min-w-[280px] bg-[#121212]/50 rounded-2xl p-4 border border-zinc-800 flex flex-col">
            <h3 className="text-white font-bold mb-4 px-2 tracking-wide uppercase text-sm border-b border-zinc-800 pb-2 flex justify-between">
              {colId}
              <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">{columns[colId]?.length || 0}</span>
            </h3>
            
            <Droppable droppableId={colId}>
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className={`flex-1 min-h-[150px] transition-colors rounded-xl p-2 ${snapshot.isDraggingOver ? 'bg-zinc-800/50' : ''}`}
                >
                  {columns[colId]?.map((app, index) => (
                    <Draggable key={app._id} draggableId={app._id} index={index} isDragDisabled={true}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-zinc-800 p-4 rounded-xl mb-3 border ${snapshot.isDragging ? 'border-blue-500 shadow-sm shadow-none' : 'border-zinc-800 shadow-sm'} group hover:border-zinc-500 transition-all`}
                        >
                          <h4 className="font-bold text-white text-sm mb-1">{app.job?.title || 'Unknown Role'}</h4>
                          <p className="text-xs text-zinc-400 mb-3 font-medium">{app.job?.company || 'Unknown Company'}</p>
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Match: {app.aiMatchScore}%</span>
                          </div>
                          
                          {colId === 'Applied' && (
                            <button 
                              onClick={() => navigate(`/mock-interview/${app.job?._id}`)}
                              className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-bold py-2 rounded-lg border border-blue-500/30 transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" /> Practice Interview
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
