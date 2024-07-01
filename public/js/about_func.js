function toggleContent(sectionId) {
    const section = document.getElementById(sectionId);
    const content = section.querySelector('.section-content');
    const readMore = section.querySelector('.read-more');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        readMore.textContent = 'Read Less';
    } else {
        content.style.display = 'none';
        readMore.textContent = 'Read More';
    }
}