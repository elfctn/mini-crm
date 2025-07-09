// tarih formatlaması için utility fonksiyonları

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Türkiye saatine çevir
  const turkishDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  
  // Bugün, dün, veya tarih formatında göster
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateToCheck = new Date(turkishDate.getFullYear(), turkishDate.getMonth(), turkishDate.getDate());
  
  if (dateToCheck.getTime() === today.getTime()) {
    return `Bugün ${turkishDate.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (dateToCheck.getTime() === yesterday.getTime()) {
    return `Dün ${turkishDate.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else {
    return turkishDate.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const turkishDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  
  return turkishDate.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 