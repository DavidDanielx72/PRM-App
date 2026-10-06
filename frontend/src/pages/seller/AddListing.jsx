import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function AddListing() {
	const { user } = useAuth();
	const nav = useNavigate();
	const [form, setForm] = useState({ title: '', description: '', price: '', image_url: '' });

	const updateField = (field) => (event) => {
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	async function submit(event) {
		event.preventDefault();

		const imageUrl = form.image_url.trim();
		if (imageUrl) {
			try {
				new URL(imageUrl);
			} catch {
				toast.error('Enter a valid image URL');
				return;
			}
		}

		const { error } = await supabase.from('listings').insert({
			seller_id: user.id,
			title: form.title,
			description: form.description,
			price: Number(form.price),
			image_url: imageUrl || null,
		});

		if (error) toast.error(error.message);
		else {
			toast.success('Listing published');
			nav('/seller');
		}
	}

	return (
		<div className="min-h-screen bg-cput-light">
			<Navbar />
			<main className="mx-auto max-w-2xl px-4 py-8">
				<form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow">
					<h1 className="text-3xl font-bold">Add listing</h1>
					<input className="input" required placeholder="Title" value={form.title} onChange={updateField('title')} />
					<textarea className="input h-32" placeholder="Description" value={form.description} onChange={updateField('description')} />
					<input className="input" required type="number" min="0" placeholder="Price" value={form.price} onChange={updateField('price')} />

					<div className="space-y-2">
						<label htmlFor="image-url" className="block text-sm font-semibold text-slate-700">
							Image URL <span className="font-normal text-slate-400">(optional)</span>
						</label>
						<input
							id="image-url"
							className="input"
							type="url"
							placeholder="https://example.com/product-image.jpg"
							value={form.image_url}
							onChange={updateField('image_url')}
						/>
						<p className="text-xs text-slate-500">Use a direct link to the product image.</p>
						{form.image_url.trim() && (
							<img
								src={form.image_url.trim()}
								alt="Product preview"
								className="h-40 w-full rounded-xl border border-slate-200 object-cover"
								onError={(event) => {
									event.currentTarget.style.display = 'none';
								}}
							/>
						)}
					</div>

					<button className="primary w-full">Publish listing</button>
				</form>
			</main>
		</div>
	);
}
