/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GoogleGenAI, GenerateContentResponse, Part } from '@google/genai';
import { FormInput } from './utils';

export const MoveInChecklist = () => {
  const formRef = useRef(null);
  const [checklistData, setChecklistData] = useState({
    landlordName: '',
    landlordContact: '',
    tenantName: '',
    tenantContact: '',
    propertyAddress: '',
    leaseStartDate: '',
    leaseEndDate: '',
    rentAmount: '',
    securityDeposit: '',
    rooms: [{ id: 1, name: 'Living Room', photos: [], items: [], loading: false, analyzed: false }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChecklistData(prev => ({ ...prev, [name]: value }));
  };

  const addRoom = () => {
    setChecklistData(prev => ({
      ...prev,
      rooms: [...prev.rooms, { id: Date.now(), name: '', photos: [], items: [], loading: false, analyzed: false }]
    }));
  };

  const removeRoom = (roomId) => {
    setChecklistData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(room => room.id !== roomId)
    }));
  };

  const handleRoomChange = (roomId, field, value) => {
    setChecklistData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => room.id === roomId ? { ...room, [field]: value } : room)
    }));
  };

  const handlePhotoUpload = (roomId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const newPhotos = [];
    let filesProcessed = 0;

    // Fix: Explicitly type `file` as `File` to resolve property access errors.
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPhotos.push({
          name: file.name,
          data: event.target.result as string, // base64
          mimeType: file.type,
        });
        filesProcessed++;
        if (filesProcessed === files.length) {
          setChecklistData(prev => ({
            ...prev,
            rooms: prev.rooms.map(room =>
              room.id === roomId ? { ...room, photos: [...room.photos, ...newPhotos] } : room
            )
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePhoto = (roomId, photoIndex) => {
     setChecklistData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId ? { ...room, photos: room.photos.filter((_, i) => i !== photoIndex) } : room
      )
    }));
  }

  const handleAnalyzePhotos = async (roomId) => {
    const room = checklistData.rooms.find(r => r.id === roomId);
    if (!room || room.photos.length === 0) {
      alert('Please upload at least one photo for this room.');
      return;
    }

    handleRoomChange(roomId, 'loading', true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const imageParts: Part[] = room.photos.map(photo => ({
        inlineData: {
          mimeType: photo.mimeType,
          data: photo.data.split(',')[1], // remove the base64 prefix
        },
      }));

      const textPart: Part = {
        text: `Analyze the following image(s) of a room. Identify and list all distinct items visible, such as furniture, appliances, fixtures, and structural elements (e.g., walls, floors, windows). Provide the list as a simple JSON array of strings. For example: ["Sofa", "Coffee Table", "Window", "Hardwood Floor"]. Only return the JSON array.`,
      };
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [...imageParts, textPart] },
      });
      
      const jsonString = response.text.trim().replace(/```json|```/g, '');
      const itemsArray = JSON.parse(jsonString);

      if (Array.isArray(itemsArray)) {
        const newItems = itemsArray.map((itemName, index) => ({
          id: `${roomId}-${index}`,
          name: itemName,
          condition: 'Not Damaged',
          description: ''
        }));
        
        handleRoomChange(roomId, 'items', newItems);
        handleRoomChange(roomId, 'analyzed', true);
      } else {
        throw new Error('AI response was not a valid array.');
      }
      
    } catch (error) {
      console.error('Error analyzing photos with AI:', error);
      alert('Failed to analyze photos. Please check the console for details and ensure your API key is set up correctly.');
    } finally {
      handleRoomChange(roomId, 'loading', false);
    }
  };
  
  const handleItemChange = (roomId, itemId, field, value) => {
     setChecklistData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId
          ? { ...room, items: room.items.map(item => item.id === itemId ? { ...item, [field]: value } : item) }
          : room
      )
    }));
  };

  const addItemToRoom = (roomId) => {
      setChecklistData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId
            ? { ...room, items: [...room.items, { id: `manual-${Date.now()}`, name: '', condition: 'Not Damaged', description: '' }] }
            : room
        )
      }));
  };

  const removeItemFromRoom = (roomId, itemId) => {
      setChecklistData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId
            ? { ...room, items: room.items.filter(item => item.id !== itemId) }
            : room
        )
      }));
  };

  const handleGeneratePdf = async () => {
    const element = formRef.current;
    if (!element) return;
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const w = imgWidth * ratio;
        const h = imgHeight * ratio;
        const x = (pageWidth - w) / 2;
        
        let position = 0;
        const pageData = canvas.toDataURL('image/png', 1.0);
        
        pdf.addImage(pageData, 'PNG', x, position, w, h);
        let heightLeft = imgHeight * (pageWidth / imgWidth) - pageHeight; // Calculate remaining height in PDF units

        while (heightLeft >= 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(pageData, 'PNG', x, position, w, h);
            heightLeft -= pageHeight;
        }

        pdf.save('move-in-checklist.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Could not generate PDF. See console for details.");
    }
  };
  
  return (
    <main className="main-content" >
        <div className="checklist-container" ref={formRef}>
            <h1 className="checklist-title">Move-In/Move-Out Checklist</h1>
            
            <div className="checklist-section">
                <h2>Property & Lease Information</h2>
                <div className="form-grid">
                    <FormInput id="propertyAddress" name="propertyAddress" label="Property Address" value={checklistData.propertyAddress} onChange={handleInputChange} />
                    <FormInput id="leaseStartDate" name="leaseStartDate" label="Lease Start Date" type="date" value={checklistData.leaseStartDate} onChange={handleInputChange} />
                    <FormInput id="leaseEndDate" name="leaseEndDate" label="Lease End Date" type="date" value={checklistData.leaseEndDate} onChange={handleInputChange} />
                    <FormInput id="rentAmount" name="rentAmount" label="Monthly Rent Amount ($)" type="number" value={checklistData.rentAmount} onChange={handleInputChange} />
                    <FormInput id="securityDeposit" name="securityDeposit" label="Security Deposit ($)" type="number" value={checklistData.securityDeposit} onChange={handleInputChange} />
                </div>
            </div>
            
            <div className="checklist-section">
                <h2>Participant Information</h2>
                <div className="form-grid">
                    <FormInput id="landlordName" name="landlordName" label="Landlord/Agent Name" value={checklistData.landlordName} onChange={handleInputChange} />
                    <FormInput id="landlordContact" name="landlordContact" label="Landlord/Agent Contact" value={checklistData.landlordContact} onChange={handleInputChange} />
                    <FormInput id="tenantName" name="tenantName" label="Tenant Name" value={checklistData.tenantName} onChange={handleInputChange} />
                    <FormInput id="tenantContact" name="tenantContact" label="Tenant Contact" value={checklistData.tenantContact} onChange={handleInputChange} />
                </div>
            </div>

            <div className="checklist-section">
                <h2>Room-by-Room Inspection</h2>
                {checklistData.rooms.map((room, roomIndex) => (
                    <div key={room.id} className="room-inspection-box">
                        <div className="room-header">
                            <FormInput
                                id={`roomName-${room.id}`}
                                label={`Room #${roomIndex + 1} Name`}
                                value={room.name}
                                onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)}
                                placeholder="e.g., Kitchen, Master Bedroom"
                            />
                            {checklistData.rooms.length > 1 && (
                                <button type="button" className="remove-btn" onClick={() => removeRoom(room.id)} aria-label={`Remove Room #${roomIndex + 1}`}>&times;</button>
                            )}
                        </div>
                        
                        <div className="room-photos-section">
                            <label>Upload Room Photos</label>
                            <div className="photo-upload-container-checklist">
                                {room.photos.map((photo, photoIndex) => (
                                    <div key={photoIndex} className="photo-preview-checklist">
                                        <img src={photo.data} alt={photo.name} />
                                        <button onClick={() => removePhoto(room.id, photoIndex)} className="remove-photo-btn">&times;</button>
                                    </div>
                                ))}
                                <div className="photo-upload-input-wrapper">
                                    <input
                                        type="file"
                                        id={`roomPhotos-${room.id}`}
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handlePhotoUpload(room.id, e)}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor={`roomPhotos-${room.id}`} className="btn btn-secondary">Add Photos</label>
                                </div>
                            </div>
                            {room.photos.length > 0 && !room.analyzed && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleAnalyzePhotos(room.id)}
                                    disabled={room.loading}
                                >
                                    {room.loading ? 'Analyzing...' : 'Analyze Photos with AI'}
                                </button>
                            )}
                        </div>

                        {room.loading && <div className="loader">Analyzing photos, please wait...</div>}

                        {room.items.length > 0 && (
                            <div className="item-checklist-table-container">
                                <table className="item-checklist-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Condition</th>
                                            <th>Damage Description</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {room.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(room.id, item.id, 'name', e.target.value)}
                                                        className="table-input"
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={item.condition}
                                                        onChange={(e) => handleItemChange(room.id, item.id, 'condition', e.target.value)}
                                                    >
                                                        <option>Not Damaged</option>
                                                        <option>Damaged</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(room.id, item.id, 'description', e.target.value)}
                                                        disabled={item.condition !== 'Damaged'}
                                                        placeholder={item.condition === 'Damaged' ? 'Describe damage...' : ''}
                                                        className="table-input"
                                                    />
                                                </td>
                                                <td>
                                                    <button onClick={() => removeItemFromRoom(room.id, item.id)} className="remove-item-btn" aria-label={`Remove ${item.name}`}>&times;</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button type="button" className="btn btn-secondary" onClick={() => addItemToRoom(room.id)}>Add Item Manually</button>
                            </div>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addRoom} className="btn btn-secondary">Add Another Room</button>
            </div>
            
            <div className="checklist-actions">
                <button type="button" className="btn btn-primary" onClick={handleGeneratePdf}>Generate Checklist PDF</button>
            </div>
        </div>
    </main>
  );
};
